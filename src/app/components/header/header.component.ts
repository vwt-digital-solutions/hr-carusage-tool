import { Component } from '@angular/core';

import { OAuthService } from 'angular-oauth2-oidc';
import { EnvService } from 'src/app/services/env/env.service';

interface ClaimsEmail {
  email: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent {
  title = 'HR Autogebruik';

  constructor(
    private env: EnvService,
    private oauthService: OAuthService
  ) {}

  logout(): void {
    this.oauthService.logOut();
  }

  sendFeedback(): void {
    window.location.href = `mailto:${this.feedbackEmail}?subject=Feedback%20HR%Autogebruik`;
  }

  get email(): string {
    const claims = this.oauthService.getIdentityClaims() as ClaimsEmail;
    if (!claims) {
      return null;
    }
    return claims.email.toLowerCase();
  }

  get feedbackEmail(): string {
    return this.env.feedbackEmail;
  }

  get isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }
}
