import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Role } from './models/role.model';
import { AuthGuard } from './services/auth/auth.guard';

import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponent } from './components/not-found/not-found.component';
import { PageNotAuthorizedComponent } from './components/not-authorized/not-authorized.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [
  {
    path: 'home',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Write] }
  },
  { path: 'login', component: LoginComponent },
  { path: 'not-authorized', component: PageNotAuthorizedComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
