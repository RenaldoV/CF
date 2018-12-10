import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../auth/auth.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './admin-nav.component.html',
  styleUrls: ['./admin-nav.component.css']
})
export class AdminNavComponent implements OnInit {

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
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
