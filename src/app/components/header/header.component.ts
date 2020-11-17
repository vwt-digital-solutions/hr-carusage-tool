import { Component } from '@angular/core';

import { AuthService } from 'src/app/services/auth/auth.service';
import { EnvService } from 'src/app/services/env/env.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent {
  title = 'HR Autogebruik';

  constructor(
    private env: EnvService,
    public authService: AuthService
  ) {}

  sendFeedback(): void {
    window.location.href = `mailto:${this.feedbackEmail}?subject=Feedback%20HR%Autogebruik`;
  }

  get feedbackEmail(): string {
    return this.env.feedbackEmail;
  }
}
