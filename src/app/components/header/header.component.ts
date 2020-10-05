import { Component, OnInit } from '@angular/core';

import { OAuthService } from 'angular-oauth2-oidc';
import { EnvService } from 'src/app/services/env/env.service';

interface ClaimsEmail {
  email: any;
}

declare let $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  title = 'HR Autogebruik';

  constructor(
    private env: EnvService,
    private oauthService: OAuthService
  ) {}

  ngOnInit() {
    if ($('.navbar-collapse').hasClass('show')) {
      $('.navbar-collapse').collapse('hide');
    }

    $('body').on('click', () => {
      if ($('.navbar-collapse').hasClass('show')) {
        $('.navbar-collapse').collapse('hide');
      }
    });
  }

  logout() {
    this.oauthService.logOut();
  }

  sendFeedback() {
    window.location.href = `mailto:${this.feedbackEmail}?subject=Feedback%20HR%20Car%20Usage`;
  }

  get email() {
    const claims = this.oauthService.getIdentityClaims() as ClaimsEmail;
    if (!claims) {
      return null;
    }
    return claims.email.toLowerCase();
  }

  get feedbackEmail() {
    return this.env.feedbackEmail;
  }
}
