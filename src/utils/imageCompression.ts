export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxBytes?: number;
  maxInputBytes?: number;
  maxOutputBytes?: number;
}

function isCompressibleImage(file: File): boolean {
  return file instanceof File && /^image\/(jpeg|jpg|png|webp)$/i.test(file.type || '');
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.decoding = 'async';

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Image failed to load'));
      image.src = url;
    });

    return image;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export async function compressImageFile(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  try {
    if (!isCompressibleImage(file)) return file;

    const maxInputBytes = options.maxInputBytes ?? 12 * 1024 * 1024;
    const maxOutputBytes = options.maxOutputBytes ?? options.maxBytes ?? 1600 * 1024;

    if (file.size > maxInputBytes) {
      throw new Error('Image is too large.');
    }

    const maxWidth = options.maxWidth ?? 1600;
    const maxHeight = options.maxHeight ?? 1600;
    const quality = Math.min(0.95, Math.max(0.55, options.quality ?? 0.82));

    const image = await loadImageFromFile(file);

    const originalWidth = image.naturalWidth || image.width;
    const originalHeight = image.naturalHeight || image.height;

    if (!originalWidth || !originalHeight) return file;

    const scale = Math.min(1, maxWidth / originalWidth, maxHeight / originalHeight);
    const width = Math.max(1, Math.round(originalWidth * scale));
    const height = Math.max(1, Math.round(originalHeight * scale));

    if (scale === 1 && file.size <= maxOutputBytes) return file;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.drawImage(image, 0, 0, width, height);

    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    let currentQuality = quality;
    let blob: Blob | null = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      blob = await canvasToBlob(canvas, outputType, currentQuality);
      if (!blob) return file;
      if (blob.size <= maxOutputBytes || currentQuality <= 0.58) break;
      currentQuality -= 0.08;
    }

    if (!blob) return file;
    if (blob.size >= file.size && file.size <= maxOutputBytes) return file;

    const extension = outputType === 'image/png' ? 'png' : 'jpg';
    const safeName = file.name.replace(/\.[^.]+$/, '') || 'image';
    const finalName = `${safeName}.${extension}`;

    return new File([blob], finalName, {
      type: outputType,
      lastModified: Date.now()
    });
  } catch (error) {
    console.warn('Image compression skipped:', error);
    return file;
  }
}

export async function compressImageForUpload(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  return compressImageFile(file, options);
}

export async function compressImageToDataUrl(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<string> {
  const compressedFile = await compressImageFile(file, options);

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not convert image to data URL.'));
      }
    };

    reader.onerror = () => {
      reject(reader.error || new Error('Image read failed.'));
    };

    reader.readAsDataURL(compressedFile);
  });
}
