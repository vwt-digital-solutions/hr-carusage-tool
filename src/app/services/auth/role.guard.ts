import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const roles = this.authService.getRoles;

    if (roles) {
      let isAuthorisedRoute = false;
      for (const value of roles) {
        if (route.data.roles.indexOf(value) > -1) {
          isAuthorisedRoute = true;
        }
      }

      if (isAuthorisedRoute) {
        return true;
      }
    } else {
      return true;
    }

    this.router.navigate(['not-authorized']);
    return false;
  }
}
