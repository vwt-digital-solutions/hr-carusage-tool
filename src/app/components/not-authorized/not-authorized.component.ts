import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-not-authorized',
  templateUrl: './not-authorized.component.html',
  styleUrls: ['./not-authorized.component.scss']
})

export class PageNotAuthorizedComponent implements OnInit {
  constructor(
    private oauthService: OAuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.oauthService.hasValidAccessToken()) {
      this.router.navigate(['login']);
    }
  }

  navigateLogin(): void {
    this.oauthService.logOut();
  }
}
