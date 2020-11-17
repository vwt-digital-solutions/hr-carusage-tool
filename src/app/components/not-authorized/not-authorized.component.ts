import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-not-authorized',
  templateUrl: './not-authorized.component.html',
  styleUrls: ['./not-authorized.component.scss']
})

export class PageNotAuthorizedComponent implements OnInit {
  constructor(
    private router: Router,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    if (!this.authService.hasValidAccessToken) {
      this.router.navigate(['login']);
    }
  }
}
