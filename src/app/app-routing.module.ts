import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';
import { AdminLogInComponent } from './Admin/admin-login/admin-log-in.component';
import { AdminHomeComponent } from './Admin/admin-home/admin-home.component';
import { AuthGuardService } from './auth/guards/auth-guard.service';
import { NotAuthService } from './auth/guards/not-auth.service';
import { AdminGuardService } from './auth/guards/admin-guard.service';
import { AddFileComponent } from './Files/add-file/add-file.component';
import { AdminSetupComponent } from './Admin/admin-setup/admin-setup.component';
import { ClientLogInComponent } from './Client/client-log-in/client-log-in.component';

const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/admin-login' },
  { path: 'admin-login', component: AdminLogInComponent, canActivate: [NotAuthService] },
  {
    path: 'admin-home',
    component: AdminHomeComponent,
    canActivate: [AuthGuardService, AdminGuardService]
  },
  { path: 'add-file', component: AddFileComponent },
  { path: 'admin-setup', component: AdminSetupComponent },
  { path: 'login/:file/:client', component: ClientLogInComponent},
  { path: 'login/:file', component: ClientLogInComponent},
  { path: '**',  redirectTo: ''}
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes/*,
      { enableTracing: true }*/ // <-- debugging purposes only
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}
