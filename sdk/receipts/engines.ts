/**
 * Receipt reading engines.
 *  - "device": Tesseract.js OCR in the browser + rule-based parsing. Free, private, works offline
 *    after the first run (language data is cached by the browser).
 *  - "cloud": the `extract-receipt` Edge Function (Claude). Higher accuracy, needs deployment + key.
 *  - "auto": cloud when available, otherwise device. Remembered per session once cloud fails to configure.
 */

import { ImageDecodeError, NATIVE_OCR_TYPES, UNREADABLE_IMAGE_MESSAGE, decodeImage, effectiveMimeType, renderBitmap } from "./image";

export type ReceiptEnginePreference = "auto" | "device" | "cloud";
export type ReceiptEngineUsed = "device" | "cloud";

export const ENGINE_STORAGE_KEY = "ziganya:receipt-engine";
const CLOUD_UNAVAILABLE_KEY = "ziganya:receipt-cloud-unavailable";

const isPreference = (v: unknown): v is ReceiptEnginePreference => v === "auto" || v === "device" || v === "cloud";

/** User override (Settings) wins over the deploy-time env default. */
export function getEnginePreference(): ReceiptEnginePreference {
  try {
    const stored = localStorage.getItem(ENGINE_STORAGE_KEY);
    if (isPreference(stored)) return stored;
  } catch {
    /* storage unavailable */
  }
  const env = import.meta.env.VITE_RECEIPT_ENGINE as string | undefined;
  return isPreference(env) ? env : "auto";
}

export function setEnginePreference(pref: ReceiptEnginePreference | null): void {
  try {
    if (pref) localStorage.setItem(ENGINE_STORAGE_KEY, pref);
    else localStorage.removeItem(ENGINE_STORAGE_KEY);
    // A manual choice resets the "cloud is unavailable" memory so the user can retry.
    sessionStorage.removeItem(CLOUD_UNAVAILABLE_KEY);
  } catch {
    /* ignore */
  }
}

export function isCloudMarkedUnavailable(): boolean {
  try {
    return sessionStorage.getItem(CLOUD_UNAVAILABLE_KEY) !== null;
  } catch {
    return false;
  }
}

export function markCloudUnavailable(reason: string): void {
  try {
    sessionStorage.setItem(CLOUD_UNAVAILABLE_KEY, reason.slice(0, 200));
  } catch {
    /* ignore */
  }
}

/** Errors that mean "the cloud engine is not set up" (as opposed to transient failures). */
export function isCloudUnavailableError(err: unknown): boolean {
  const m = (err instanceof Error ? err.message : String(err ?? "")).toLowerCase();
  return m.includes("isn't deployed") || m.includes("isn't configured") || m.includes("misconfigured") || m.includes("not found");
}

/* ------------------------------------------------------------------ */
/* On-device OCR                                                        */
/* ------------------------------------------------------------------ */

export interface OcrProgress {
  stage: "loading" | "recognizing";
  /** 0..1 */
  progress: number;
}

export interface OcrResult {
  text: string;
  /** Tesseract mean confidence, 0..100 */
  confidence: number;
}

const OCR_MAX_EDGE_PX = 2200;

/**
 * Prepare an image for OCR: decode (converting HEIC if needed), cap the longest
 * edge, grayscale + contrast bump, export lossless PNG. Throws a friendly error
 * when the photo cannot be decoded instead of letting Tesseract fail cryptically.
 */
async function prepareForOcr(file: File): Promise<Blob> {
  // If the browser itself cannot decode the photo, Tesseract won't either — fail fast
  // with a clear message instead of letting the OCR worker log cryptic errors.
  const bitmap = await decodeImage(file);
  if (!bitmap) throw new ImageDecodeError(UNREADABLE_IMAGE_MESSAGE);
  try {
    const blob = await renderBitmap(bitmap, { maxEdge: OCR_MAX_EDGE_PX, type: "image/png", enhance: true });
    if (blob) return blob;
    if (NATIVE_OCR_TYPES.includes(effectiveMimeType(file))) return file;
    throw new ImageDecodeError(UNREADABLE_IMAGE_MESSAGE);
  } finally {
    bitmap.close();
  }
}

/** Run Tesseract in a web worker. Worker, core and English data load from the CDN on first use. */
export async function recognizeReceiptOnDevice(file: File, onProgress?: (p: OcrProgress) => void): Promise<OcrResult> {
  if (effectiveMimeType(file) === "application/pdf") {
    throw new Error("PDF receipts need the cloud reader. Take a photo of the receipt instead.");
  }
  const image = await prepareForOcr(file);
  const { createWorker, PSM } = await import("tesseract.js");

  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (!onProgress) return;
      if (m.status === "recognizing text") onProgress({ stage: "recognizing", progress: m.progress ?? 0 });
      else onProgress({ stage: "loading", progress: m.progress ?? 0 });
    },
  });

  try {
    // Receipts are a single column of text; telling Tesseract so avoids layout guesses.
    await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK, preserve_interword_spaces: "1" });
    let data: { text: string; confidence: number };
    try {
      ({ data } = await worker.recognize(image));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/read image|pixRead|unknown format/i.test(msg)) throw new ImageDecodeError(UNREADABLE_IMAGE_MESSAGE);
      throw err;
    }
    return { text: data.text ?? "", confidence: Number.isFinite(data.confidence) ? data.confidence : 0 };
  } finally {
    await worker.terminate().catch(() => undefined);
  }
}
