/**
 * Image decoding for receipts. Browsers other than Safari cannot decode HEIC
 * (the default iPhone photo format), so we convert those with a WebAssembly
 * decoder that is loaded only when needed.
 */

export const NATIVE_OCR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/gif", "image/tiff"];

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  bmp: "image/bmp",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
};

/** MIME type, falling back to the file extension (mobile browsers often send an empty type). */
export function effectiveMimeType(file: File): string {
  if (file.type && file.type !== "application/octet-stream") return file.type.toLowerCase();
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  return EXT_TO_MIME[ext] ?? "";
}

export function isHeicLike(file: File): boolean {
  const t = effectiveMimeType(file);
  return t === "image/heic" || t === "image/heif" || t === "image/heic-sequence" || t === "image/heif-sequence";
}

export class ImageDecodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageDecodeError";
  }
}

async function bitmapViaImgElement(blob: Blob): Promise<ImageBitmap | null> {
  if (typeof Image === "undefined") return null;
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return await createImageBitmap(img);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Decode any supported photo into an ImageBitmap. HEIC/HEIF is converted to JPEG
 * first when the browser cannot decode it natively. Returns null if nothing works.
 */
export async function decodeImage(file: File): Promise<ImageBitmap | null> {
  if (typeof createImageBitmap !== "function") return null;

  try {
    return await createImageBitmap(file);
  } catch {
    /* fall through */
  }

  if (isHeicLike(file)) {
    try {
      const { heicTo } = await import("heic-to");
      const jpeg = await heicTo({ blob: file, type: "image/jpeg", quality: 0.92 });
      return await createImageBitmap(jpeg);
    } catch {
      /* fall through */
    }
  }

  return bitmapViaImgElement(file);
}

export interface RenderOptions {
  maxEdge: number;
  type: "image/jpeg" | "image/png";
  quality?: number;
  /** Grayscale + contrast bump, useful for OCR on faded thermal paper. */
  enhance?: boolean;
}

/** Draw a bitmap to a canvas (downscaled to `maxEdge`) and export it. */
export async function renderBitmap(bitmap: ImageBitmap, options: RenderOptions): Promise<Blob | null> {
  if (typeof document === "undefined") return null;
  const scale = Math.min(1, options.maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  if (options.enhance && "filter" in ctx) ctx.filter = "grayscale(1) contrast(1.2)";
  ctx.drawImage(bitmap, 0, 0, width, height);
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, options.type, options.quality));
}

export const UNREADABLE_IMAGE_MESSAGE =
  "This photo couldn't be decoded in your browser. If it's an iPhone HEIC photo, use the Take a photo button or convert it to JPEG first.";
