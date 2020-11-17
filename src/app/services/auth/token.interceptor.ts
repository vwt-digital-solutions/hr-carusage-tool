import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable} from 'rxjs';

import { AuthService } from './auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    public authService: AuthService
  ) {
  }

  intercept(request: HttpRequest<Array<string>>, next: HttpHandler): Observable<HttpEvent<Array<string>>> {

    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.authService.accessToken}`
      }
    });
    return next.handle(request);
  }
}
