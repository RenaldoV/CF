import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class EntityAuthGuardService implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> | boolean {
    if (!this.auth.isAuthenticated()) {
      alert('You are not logged in. Please follow the link from your email to log in.');
      return new Promise((resolve, reject) => {
        resolve(false);
      });
    } else {
      if (this.auth.isContact()) {
        return this.auth.isEntity();
      } else {
        return new Promise((resolve, reject) => {
          resolve(false);
        });
      }
    }
  }
}
