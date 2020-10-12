import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private oauthService: OAuthService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
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
    } else {
      return true;
    }

    this.router.navigate(['not-authorized']);
    return false;
  }
}
