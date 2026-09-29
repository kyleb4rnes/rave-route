import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
  standalone: true,
  imports: [AppHeaderComponent, IonButton, IonContent, RouterLink],
})
export class HelpPage {}
