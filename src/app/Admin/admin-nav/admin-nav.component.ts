import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../auth/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {interval} from 'rxjs';
import {startWith, switchMap} from 'rxjs/operators';
import {AdminService} from '../admin.service';

@Component({
  selector: 'app-nav',
  templateUrl: './admin-nav.component.html',
  styleUrls: ['./admin-nav.component.css']
})
export class AdminNavComponent implements OnInit {
  smsCredits;
  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    interval(20000)
      .pipe(
        startWith(0),
        switchMap(() => this.adminService.getSmsCredits())
      )
      .subscribe(res => {
        this.smsCredits = res;
      });
  }
  logout() {
    this.auth.destroySession();
    this.router.navigate(['']);
  }
  showRoute() {
    let route = this.router.url.replace('/', ' / ').replace('-', ' ');
    route = route.toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');
    return route;
  }
  getName() {
    return this.auth.getName();
  }
  isAdmin() {
    return this.auth.isAdmin();
  }

}
