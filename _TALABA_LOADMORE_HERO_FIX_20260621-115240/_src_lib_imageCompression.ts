export type ImageCompressionOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxInputBytes?: number;
  maxOutputBytes?: number;
};

const DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.82,
  maxInputBytes: 8 * 1024 * 1024,
  maxOutputBytes: 1600 * 1024,
};

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function extensionFromMime(type: string) {
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  return 'jpg';
}

function safeBaseName(name: string) {
  const clean = String(name || 'image')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

  return clean || 'image';
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image file'));
    };

    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Image compression failed'));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

export function validateImageBeforeUpload(file: File, options: ImageCompressionOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!file) {
    throw new Error('No image selected');
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Only JPG, PNG, and WEBP images are allowed.');
  }

  if (file.size > opts.maxInputBytes) {
    throw new Error(`Image is too large. Maximum allowed size is ${Math.round(opts.maxInputBytes / 1024 / 1024)}MB.`);
  }

  if (file.name && /\.(svg|html?|js|php|exe|bat|cmd|ps1|zip|rar|7z)$/i.test(file.name)) {
    throw new Error('This file type is not allowed for image upload.');
  }
}

export async function compressImageForUpload(file: File, options: ImageCompressionOptions = {}): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  validateImageBeforeUpload(file, opts);

  const img = await loadImageFromFile(file);

  const originalWidth = img.naturalWidth || img.width;
  const originalHeight = img.naturalHeight || img.height;

  if (!originalWidth || !originalHeight) {
    throw new Error('Invalid image dimensions.');
  }

  const scale = Math.min(1, opts.maxWidth / originalWidth, opts.maxHeight / originalHeight);
  const targetWidth = Math.max(1, Math.round(originalWidth * scale));
  const targetHeight = Math.max(1, Math.round(originalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new Error('Your browser cannot process this image.');
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  let outputType = 'image/webp';
  let outputBlob: Blob;

  try {
    outputBlob = await canvasToBlob(canvas, outputType, opts.quality);
  } catch {
    outputType = 'image/jpeg';
    outputBlob = await canvasToBlob(canvas, outputType, opts.quality);
  }

  if (outputBlob.size > opts.maxOutputBytes) {
    outputBlob = await canvasToBlob(canvas, outputType, 0.68);
  }

  if (outputBlob.size > opts.maxOutputBytes) {
    outputBlob = await canvasToBlob(canvas, outputType, 0.55);
  }

  if (outputBlob.size > opts.maxOutputBytes) {
    throw new Error('Image is still too large after compression. Please choose a smaller image.');
  }

  const ext = extensionFromMime(outputType);
  const newName = `${safeBaseName(file.name)}-optimized.${ext}`;

  return new File([outputBlob], newName, {
    type: outputType,
    lastModified: Date.now(),
  });
}
