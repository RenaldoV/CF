import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import {Observable} from 'rxjs/index';

@Injectable({
  providedIn: 'root'
})
export class AdminGuardService implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }
  canActivate(): Promise<boolean> | boolean {
    return this.auth.isAdmin().then(res => {
      if (res) {
        return true;
      } else if (this.auth.isAuthenticated()) {
        alert('You are not authorized to access this page');
        const ct = this.auth.getUser();
        this.router.navigate(['/login', ct.fileID, ct._id]);
        return false;
      }
      return false;
    });
  }
}
