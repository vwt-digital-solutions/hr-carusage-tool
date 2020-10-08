import { Component } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeNl from '@angular/common/locales/nl';

import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { EnvService } from './services/env/env.service';

import { LicenseManager } from 'ag-grid-enterprise';

registerLocaleData(localeNl);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(
    private env: EnvService,
    private oauthService: OAuthService
  ) {
    const config = new AuthConfig();
    config.loginUrl = env.loginUrl;
    config.redirectUri = window.location.origin + '/home';
    config.logoutUrl = env.logoutUrl;
    config.clientId = env.clientId;
    config.scope = env.scope;
    config.issuer = env.issuer;
    config.silentRefreshRedirectUri = window.location.origin + '/silent-refresh.html';
    this.oauthService.configure(config);
    this.oauthService.setupAutomaticSilentRefresh();
    this.oauthService.tryLogin({});

    LicenseManager.setLicenseKey(env.agGridKey);
  }
}
