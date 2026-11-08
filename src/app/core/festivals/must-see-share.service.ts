import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

@Injectable({ providedIn: 'root' })
export class MustSeeShareService {
  async shareText(title: string, text: string): Promise<'shared' | 'cancelled' | 'unavailable'> {
    try {
      const result = await Share.canShare();
      if (!result.value) return 'unavailable';
      await Share.share({ title, text, dialogTitle: title });
      return 'shared';
    } catch {
      return 'cancelled';
    }
  }

  async copyText(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const copied = document.execCommand('copy');
      area.remove();
      return copied;
    } catch {
      return false;
    }
  }

  async shareCalendar(title: string, filename: string, content: string): Promise<'shared' | 'downloaded' | 'cancelled' | 'unavailable'> {
    try {
      if (Capacitor.isNativePlatform()) {
        const written = await Filesystem.writeFile({
          path: filename,
          data: btoa(unescape(encodeURIComponent(content))),
          directory: Directory.Cache,
        });
        const shareable = await Share.canShare();
        if (!shareable.value) return 'unavailable';
        await Share.share({ title, url: written.uri, dialogTitle: title });
        return 'shared';
      }

      const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      return 'downloaded';
    } catch {
      return 'cancelled';
    }
  }
}
