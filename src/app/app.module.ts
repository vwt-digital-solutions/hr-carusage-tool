import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { OAuthModule, OAuthService } from 'angular-oauth2-oidc';
import { AuthGuard } from './services/auth/auth.guard';
import { TokenInterceptor } from './services/auth/token.interceptor';
import { EnvServiceProvider } from './services/env/env.service.provider';
import { HeaderComponent } from './components/header/header.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PageNotFoundComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    OAuthModule.forRoot(),
    AppRoutingModule
  ],
  exports: [
    PageNotFoundComponent
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
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
