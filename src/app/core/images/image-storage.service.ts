import { Injectable } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';

const imageReferencePrefix = 'rave-route-image://';
const imageDirectory = 'images';

@Injectable({ providedIn: 'root' })
export class ImageStorageService {
  private readonly resolvedUrls = new Map<string, string>();

  async storeImage(imageUrl: string): Promise<string> {
    if (!isDataImage(imageUrl) || isStoredImageReference(imageUrl)) {
      return imageUrl;
    }

    const { mimeType, base64Data } = parseDataImage(imageUrl);
    const path = `${imageDirectory}/${crypto.randomUUID()}.${getFileExtension(mimeType)}`;

    await Filesystem.writeFile({
      path,
      directory: Directory.Data,
      data: base64Data,
      recursive: true,
    });

    return `${imageReferencePrefix}${path}`;
  }

  async resolveImageUrl(imageUrl: string): Promise<string> {
    if (!isStoredImageReference(imageUrl)) {
      return imageUrl;
    }

    const cachedUrl = this.resolvedUrls.get(imageUrl);

    if (cachedUrl) {
      return cachedUrl;
    }

    const path = imageUrl.slice(imageReferencePrefix.length);
    const file = await Filesystem.readFile({ path, directory: Directory.Data });
    const mimeType = getMimeType(path);
    const resolvedUrl =
      file.data instanceof Blob
        ? URL.createObjectURL(file.data)
        : `data:${mimeType};base64,${file.data}`;

    this.resolvedUrls.set(imageUrl, resolvedUrl);

    return resolvedUrl;
  }

  async removeImage(imageUrl: string | undefined): Promise<void> {
    if (!isStoredImageReference(imageUrl)) {
      return;
    }

    const path = imageUrl.slice(imageReferencePrefix.length);
    const resolvedUrl = this.resolvedUrls.get(imageUrl);

    try {
      await Filesystem.deleteFile({ path, directory: Directory.Data });
      this.resolvedUrls.delete(imageUrl);

      if (resolvedUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(resolvedUrl);
      }
    } catch {
      // A failed cleanup must never prevent the user from saving their change.
    }
  }
}

export function isStoredImageReference(value: string | undefined): value is string {
  return Boolean(value?.startsWith(imageReferencePrefix));
}

function isDataImage(value: string): boolean {
  return /^data:image\/(?:jpeg|jpg|png|gif|webp);base64,/i.test(value);
}

function parseDataImage(value: string): { mimeType: string; base64Data: string } {
  const match = /^data:(image\/(?:jpeg|jpg|png|gif|webp));base64,(.+)$/i.exec(value);

  if (!match) {
    throw new Error('The selected image is not valid base64 image data.');
  }

  return { mimeType: match[1].toLowerCase(), base64Data: match[2] };
}

function getFileExtension(mimeType: string): string {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
}

function getMimeType(path: string): string {
  switch (path.split('.').pop()?.toLowerCase()) {
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
}
