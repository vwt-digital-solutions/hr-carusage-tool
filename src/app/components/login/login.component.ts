import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  constructor(
    private oauthService: OAuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.oauthService.hasValidAccessToken()) {
      this.router.navigate(['home']);
    }
  }

  public login($event: Event): void {
    $event.preventDefault();
    this.oauthService.initLoginFlow();
  }
}
