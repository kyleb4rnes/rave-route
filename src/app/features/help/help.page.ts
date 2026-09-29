import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
  standalone: true,
  imports: [AppHeaderComponent, IonContent],
})
export class HelpPage {
  private readonly location = inject(Location);

  readonly isClosing = signal(false);
  readonly expandedSection = signal<string | null>(null);

  toggleSection(section: string): void {
    this.expandedSection.update((expandedSection) => expandedSection === section ? null : section);
  }

  closeHelp(): void {
    if (this.isClosing()) {
      return;
    }

    this.isClosing.set(true);
    setTimeout(() => this.location.back(), 650);
  }
}
