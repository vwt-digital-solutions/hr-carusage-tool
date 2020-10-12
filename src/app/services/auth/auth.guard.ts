import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { OAuthService } from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private oauthService: OAuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    console.log(this.router.url);

    if (this.oauthService.hasValidAccessToken()) {
      const claims = this.oauthService.getIdentityClaims();

      if (route.data.roles) {
        if (claims && 'roles' in claims) {
          let isAuthorisedRoute = false;

          for (const value of claims['roles']) {
            if (route.data.roles.indexOf(value) > -1) {
              isAuthorisedRoute = true;
            }
          }

          if (isAuthorisedRoute) {
            return true;
          }
        }

        this.router.navigate(['not-authorized']);
        return false;
      } else {
        return true;
      }
    } else {
      this.router.navigate(['login']);
      return false;
    }
  }
}
