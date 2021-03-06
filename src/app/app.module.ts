import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { LicensePlatePipe } from './pipes/license-plate.pipe';
import { NestedValuePipe } from './pipes/nested-value.pipe';
import { TripKindPipe } from './pipes/trip-kind.pipe';
import { TimeDifferencePipe } from './pipes/time-difference.pipe';

import { AgGridModule } from 'ag-grid-angular';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

import { OAuthModule, OAuthService } from 'angular-oauth2-oidc';
import { AuthGuard } from './services/auth/auth.guard';
import { TokenInterceptor } from './services/auth/token.interceptor';
import { BlobErrorHttpInterceptor } from './services/blob-error-http.interceptor';
import { EnvServiceProvider } from './services/env/env.service.provider';

import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HeaderComponent } from './components/header/header.component';
import { PageNotFoundComponent } from './components/not-found/not-found.component';
import { PageNotAuthorizedComponent } from './components/not-authorized/not-authorized.component';
import { TripInformationComponent } from './components/trip-information/trip-information.component';
import { LoginComponent } from './components/login/login.component';
import { ApproveModalComponent } from './components/approve-modal/approve-modal.component';
import { AuditModalComponent } from './components/audit-modal/audit-modal.component';
import { FrequentOffendersComponent } from './components/frequent-offenders/frequent-offenders.component';
import { ToastComponent } from './components/toast/toast.component';

@NgModule({
  declarations: [
    LicensePlatePipe,
    AppComponent,
    HeaderComponent,
    PageNotFoundComponent,
    PageNotAuthorizedComponent,
    DashboardComponent,
    TripInformationComponent,
    LoginComponent,
    ApproveModalComponent,
    AuditModalComponent,
    ToastComponent,
    NestedValuePipe,
    TripKindPipe,
    TimeDifferencePipe,
    FrequentOffendersComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    NgbDropdownModule,
    NgbModule,
    OAuthModule.forRoot(),
    AgGridModule.withComponents([]),
    LeafletModule,
    AppRoutingModule
  ],
  exports: [
    LicensePlatePipe,
    TimeDifferencePipe,
    PageNotFoundComponent,
    PageNotAuthorizedComponent
  ],
  providers: [
    EnvServiceProvider,
    AuthGuard,
    OAuthService,
    {
      provide: LOCALE_ID,
      useValue: 'nl-NL'
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BlobErrorHttpInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
