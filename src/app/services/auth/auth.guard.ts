import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.authService.hasValidAccessToken) {
      const roles = this.authService.getRoles;

      if (roles) {
        let isAuthorisedRoute = false;

        for (const value of roles) {
          if (route.data.roles.indexOf(value) > -1) {
            isAuthorisedRoute = true;
          }
        }

        if (isAuthorisedRoute) {
          this.authService.initRoles();
          return true;
        }

        this.router.navigate(['not-authorized']);
        return false;
      } else {
        this.authService.initRoles();
        return true;
      }
    } else {
      this.router.navigate(['login']);
      return false;
    }
  }
}
