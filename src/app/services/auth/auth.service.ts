import { Injectable } from '@angular/core';

import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { EnvService } from '../env/env.service';

interface ClaimsEmail {
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public roles = [];

  constructor(
    private oauthService: OAuthService,
    private env: EnvService
  ) { }

  public initAuth(): void {
    const config = new AuthConfig();
    config.loginUrl = this.env.loginUrl;
    config.redirectUri = window.location.origin + '/login';
    config.logoutUrl = this.env.logoutUrl;
    config.clientId = this.env.clientId;
    config.scope = this.env.scope;
    config.issuer = this.env.issuer;
    config.silentRefreshRedirectUri = window.location.origin + '/silent-refresh.html';
    this.oauthService.configure(config);
    this.oauthService.setupAutomaticSilentRefresh();
    this.oauthService.tryLogin({});
  }

  public initRoles(): void {
    this.roles = this.getRoles;
  }

  public login(): void {
    this.oauthService.initLoginFlow();
  }

  public logout(): void {
    this.oauthService.logOut();
  }

  get hasValidAccessToken(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  get accessToken(): string {
    return this.oauthService.getAccessToken();
  }

  get getRoles(): Array<string> {
    const claims = this.oauthService.getIdentityClaims();
    const scopes = this.oauthService.getGrantedScopes();
    let roles = [];

    if (claims && 'roles' in claims) {
      roles = roles.concat(claims['roles']);
    }
    if (scopes) {
      for (const key in scopes) {
        if (key in scopes) {
          roles.push(scopes[key].replace(/(?:https?|ftp):\/\/[\n\S]+\//g, ''));
        }
      }
    }

    return roles;
  }

  get email(): string {
    const claims = this.oauthService.getIdentityClaims() as ClaimsEmail;
    if (!claims) {
      return null;
    }
    return claims.email.toLowerCase();
  }

  get isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  get isReader(): boolean {
    return this.roles.includes('carusage.read') ? true : false;
  }

  get isWriter(): boolean {
    return this.roles.includes('carusage.write') ? true : false;
  }
}
