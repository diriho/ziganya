import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Upload } from "@sdk/db";
import { uploadReceipt } from "../storage";
import {
  extractReceipt,
  getEnginePreference,
  isCloudMarkedUnavailable,
  isCloudUnavailableError,
  linkReceiptToTransaction,
  markCloudUnavailable,
  normalizeExtraction,
  parseReceiptText,
  prepareReceiptFile,
  recognizeReceiptOnDevice,
  recordDeviceExtraction,
  setUploadStatus,
  type ReceiptEnginePreference,
  type ReceiptEngineUsed,
  type ReceiptExtraction,
} from "../receipts";

export interface ScanProgress {
  stage: "preparing" | "uploading" | "cloud" | "ocr-loading" | "ocr" | "parsing";
  /** 0..1 when known */
  progress?: number;
  engine?: ReceiptEngineUsed;
}

export interface ScanReceiptInput {
  file: File;
  defaultCurrency?: string;
  categories?: Array<{ id: string; name: string }>;
  engine?: ReceiptEnginePreference;
  onProgress?: (p: ScanProgress) => void;
}

export interface ScanReceiptResult {
  /** Null when the image could not be stored (e.g. bucket missing) but on-device OCR still ran. */
  upload: Upload | null;
  extraction: ReceiptExtraction;
  storedFile: File;
  engine: ReceiptEngineUsed;
  ocrConfidence?: number;
  /** Something worth telling the user (fallbacks, storage skipped). */
  notice?: string;
}

/**
 * Compress → store → read. "auto" tries the cloud reader first and falls back to
 * on-device OCR when the cloud isn't deployed/configured or the image couldn't be stored.
 */
export const useScanReceipt = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, defaultCurrency, categories, engine, onProgress }: ScanReceiptInput): Promise<ScanReceiptResult> => {
      const pref = engine ?? getEnginePreference();
      const isPdf = file.type === "application/pdf";
      if (pref === "device" && isPdf) throw new Error("PDF receipts need the cloud reader. Take a photo of the receipt instead.");

      let wantCloud = pref === "cloud" || isPdf || (pref === "auto" && !isCloudMarkedUnavailable());
      const notices: string[] = [];

      onProgress?.({ stage: "preparing" });
      // Converts HEIC → JPEG and downsizes; throws a friendly error if the photo can't be decoded.
      const storedFile = await prepareReceiptFile(file);

      onProgress?.({ stage: "uploading" });
      let upload: Upload | null = null;
      try {
        upload = await uploadReceipt(userId, storedFile);
        await setUploadStatus(userId, upload.id, "processing").catch(() => undefined);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Storage error";
        console.warn("[receipts] upload skipped:", msg);
        if (pref === "cloud" || isPdf) throw new Error(`Couldn't store the receipt (${msg}).`);
        notices.push(`The image wasn't saved (${msg}). Only the transaction will be kept.`);
        wantCloud = false; // cloud needs the stored file
      }

      const normalizeOpts = { defaultCurrency, categories };

      if (wantCloud && upload) {
        onProgress?.({ stage: "cloud", engine: "cloud" });
        try {
          const extraction = await extractReceipt({ path: upload.file_path ?? "", uploadId: upload.id, defaultCurrency, categories });
          return { upload, extraction, storedFile, engine: "cloud", notice: notices[0] };
        } catch (err) {
          if (pref === "cloud" || isPdf) {
            await setUploadStatus(userId, upload.id, "failed", err instanceof Error ? err.message.slice(0, 500) : "Extraction failed").catch(() => undefined);
            throw err;
          }
          if (isCloudUnavailableError(err)) markCloudUnavailable(err instanceof Error ? err.message : "unavailable");
          notices.push("The cloud reader wasn't available, so this receipt was read on your device.");
        }
      }

      // On-device path
      try {
        onProgress?.({ stage: "ocr-loading", progress: 0, engine: "device" });
        const ocr = await recognizeReceiptOnDevice(storedFile, (p) =>
          onProgress?.({ stage: p.stage === "loading" ? "ocr-loading" : "ocr", progress: p.progress, engine: "device" })
        );
        onProgress?.({ stage: "parsing", engine: "device" });
        const raw = parseReceiptText(ocr.text, { defaultCurrency, categories, ocrConfidence: ocr.confidence });
        const extraction = normalizeExtraction(raw, normalizeOpts);
        if (upload) await recordDeviceExtraction(userId, upload.id, { text: ocr.text, ocrConfidence: ocr.confidence, extraction: raw }).catch(() => undefined);
        return { upload, extraction, storedFile, engine: "device", ocrConfidence: ocr.confidence, notice: notices[0] };
      } catch (err) {
        if (upload) await setUploadStatus(userId, upload.id, "failed", err instanceof Error ? err.message.slice(0, 500) : "OCR failed").catch(() => undefined);
        throw err;
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["uploads", userId] });
    },
  });
};

/** After the user confirms, tie the upload (if any) to the saved transaction. */
export const useFinalizeReceipt = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ upload, transactionId, extraction }: { upload: Upload | null; transactionId: string; extraction: ReceiptExtraction }) => {
      if (!upload) return;
      await linkReceiptToTransaction(userId, upload, transactionId, extraction);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["uploads", userId] });
    },
  });
};

/** If the user abandons a scan, don't leave the upload looking "processing". */
export const useDiscardReceipt = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (upload: Upload | null) => {
      if (!upload) return;
      await setUploadStatus(userId, upload.id, "discarded");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["uploads", userId] });
    },
  });
};
