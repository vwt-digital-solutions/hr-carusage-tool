import { Component } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeNl from '@angular/common/locales/nl';

import { EnvService } from './services/env/env.service';

import { LicenseManager } from 'ag-grid-enterprise';

import * as moment from 'moment';
import { AuthService } from './services/auth/auth.service';

registerLocaleData(localeNl);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(
    private env: EnvService,
    private authService: AuthService
  ) {
    this.authService.initAuth();

    moment.locale('nl');
    LicenseManager.setLicenseKey(env.agGridKey);
  }
}
