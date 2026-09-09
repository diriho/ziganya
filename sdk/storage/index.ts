/**
 * Receipt uploads: file goes to Supabase Storage, metadata to the `uploads` table.
 * The bucket must exist (see README → Storage). Errors are surfaced as friendly messages.
 */
import { dbClient, type Upload } from "../db";
import { effectiveMimeType } from "../receipts/image";

export const RECEIPTS_BUCKET = "receipts";
export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;
/** Accepted uploads. HEIC/HEIF are converted to JPEG before anything reads them. */
export const RECEIPT_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif", "application/pdf"];

export function validateReceiptFile(file: File): string | null {
  const mime = effectiveMimeType(file);
  if (!RECEIPT_MIME_TYPES.includes(mime)) return "Upload a JPEG, PNG, WebP, HEIC image or a PDF.";
  if (file.size > MAX_RECEIPT_BYTES) return "File must be smaller than 10 MB.";
  return null;
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 80) || "receipt";
}

export async function uploadReceipt(userId: string, file: File): Promise<Upload> {
  const invalid = validateReceiptFile(file);
  if (invalid) throw new Error(invalid);

  const mime = effectiveMimeType(file) || "application/octet-stream";
  const path = `${userId}/${Date.now()}-${safeFileName(file.name)}`;
  const { error: storageError } = await dbClient.storage
    .from(RECEIPTS_BUCKET)
    .upload(path, file, { contentType: mime, upsert: false });

  if (storageError) {
    const msg = storageError.message?.toLowerCase() ?? "";
    if (msg.includes("bucket not found")) {
      throw new Error(`Storage bucket "${RECEIPTS_BUCKET}" is missing. Create it in Supabase → Storage.`);
    }
    if (msg.includes("row-level security") || msg.includes("not authorized") || msg.includes("policy")) {
      throw new Error("Upload blocked by storage policy. Allow authenticated users to upload to the receipts bucket.");
    }
    throw new Error(storageError.message || "Upload failed.");
  }

  const { data, error } = await dbClient
    .from("uploads")
    .insert({
      user_id: userId,
      // The kind of document, not the MIME type: everything scanned here is a receipt.
      type: "receipt",
      file_name: file.name,
      file_path: path,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    // Roll back the stored file so we don't leave orphans.
    await dbClient.storage.from(RECEIPTS_BUCKET).remove([path]).catch(() => undefined);
    const detail = [error.message, error.details, error.hint].filter(Boolean).join(" — ");
    throw new Error(`Could not record the upload in the uploads table: ${detail || "unknown database error"}`);
  }
  return data;
}
