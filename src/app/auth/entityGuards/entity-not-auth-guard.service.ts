import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class EntityNotAuthGuardService implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {
    const entityID = route.paramMap.get('entity');
    const contactID = route.paramMap.get('contact');
    if (this.auth.isAuthenticated()) {
      if (this.auth.isContact()) {
        alert('Already logged in');
        this.router.navigate(['/entity', entityID]);
        return false;
      } else {
        this.router.navigate(['/admin-home']);
        return false;
      }
    } else {
      return true;
    }
  }
}
