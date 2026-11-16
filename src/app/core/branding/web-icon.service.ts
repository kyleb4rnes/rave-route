import { Injectable } from '@angular/core';
import { ThemeColour } from '../settings/theme-colours';

@Injectable({ providedIn: 'root' })
export class WebIconService {
  update(themeColour: ThemeColour): void {
    if (typeof document === 'undefined') {
      return;
    }

    const iconPath = `icons/themes/${themeColour}`;
    this.setLinkHref('icon', `${iconPath}/icon-64x64.png`);
    this.setLinkHref('apple-touch-icon', `${iconPath}/icon-180x180.png`);
    this.setLinkHref('manifest', `manifest-${themeColour}.webmanifest`);

    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    themeColor?.setAttribute('content', this.primaryColour(themeColour));
  }

  private setLinkHref(rel: string, href: string): void {
    const link = document.querySelector<HTMLLinkElement>(`link[rel~="${rel}"]`);
    link?.setAttribute('href', href);
  }

  private primaryColour(themeColour: ThemeColour): string {
    return {
      red: '#d92332',
      blue: '#2563eb',
      green: '#167a3f',
      purple: '#7c3aed',
      pink: '#db2777',
    }[themeColour];
  }
}
