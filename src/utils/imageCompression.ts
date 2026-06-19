export type ImageCompressionOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputType?: "image/jpeg" | "image/webp";
  maxBytes?: number;
};

const DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 1400,
  maxHeight: 1400,
  quality: 0.72,
  outputType: "image/jpeg",
  maxBytes: 750 * 1024,
};

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error("Image compression failed.")),
      type,
      quality
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => resolve(String(event.target?.result || ""));
    reader.onerror = () => reject(new Error("Could not read compressed image."));
    reader.readAsDataURL(blob);
  });
}

export async function compressImageToDataUrl(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<string> {
  const settings = { ...DEFAULT_OPTIONS, ...options };

  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const bitmap = await createImageBitmap(file);

  const ratio = Math.min(
    settings.maxWidth / bitmap.width,
    settings.maxHeight / bitmap.height,
    1
  );

  const width = Math.max(1, Math.round(bitmap.width * ratio));
  const height = Math.max(1, Math.round(bitmap.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    bitmap.close();
    throw new Error("Browser cannot compress this image.");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = settings.quality;
  let blob = await canvasToBlob(canvas, settings.outputType, quality);

  while (blob.size > settings.maxBytes && quality > 0.42) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, settings.outputType, quality);
  }

  return blobToDataUrl(blob);
}
