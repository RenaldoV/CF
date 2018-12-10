import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';
import { AdminLogInComponent } from './Admin/admin-login/admin-log-in.component';
import { AdminHomeComponent } from './Admin/admin-home/admin-home.component';
import { AdminAuthGuardService } from './auth/adminGuards/admin-auth-guard.service';
import { NotAuthService } from './auth/adminGuards/not-auth.service';
import { AdminGuardService } from './auth/adminGuards/admin-guard.service';
import { AddFileComponent } from './Files/add-file/add-file.component';
import { AdminSetupComponent } from './Admin/admin-setup/admin-setup.component';
import { ContactLogInComponent } from './Contact/contact-log-in/contact-log-in.component';
import { FileComponent } from './Files/file/file.component';
import {ContactNotAuthGuardService} from './auth/contactGuards/contact-not-auth-guard.service';


const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/admin-login' },
  { path: 'admin-login', component: AdminLogInComponent, canActivate: [NotAuthService] },
  {
    path: 'admin-home',
    component: AdminHomeComponent,
    canActivate: [AdminAuthGuardService, AdminGuardService]
  },
  {
    path: 'add-file',
    component: AddFileComponent,
    canActivate: [AdminAuthGuardService, AdminGuardService]
  },
  {
    path: 'admin-setup',
    component: AdminSetupComponent,
    canActivate: [AdminAuthGuardService, AdminGuardService]
  },
  {
    path: 'login/:file/:contact',
    component: ContactLogInComponent,
    canActivate: [ContactNotAuthGuardService]
  },
  { path: 'file/:id', component: FileComponent},
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
