import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { WINDOW } from '../window.service';
import { IUser } from '../../interfaces/IUser';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private host;
  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(WINDOW) private window: Window
    ) {
    this.host = 'http://' + window.location.hostname + ':4000/user';
  }

  addUser (user) {
    console.log(user);
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    this.http.post<any>(`${this.host}/addUser`, user)
      .subscribe(res => {
        if (res) {
          // this.saveUser(res.user);
          // console.log(res);
        } else {
          return res;
        }
      }, err => {
        console.log(err);
        return false;
      });
  }
  loginUser (user) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    this.http.post<IUser>(`${this.host}/login`, user)
      .subscribe(res => {
        if (res) {
          this.saveUser(res);
          this.router.navigate(['/admin-home']);
        } else {
          alert('Email and password combination is incorrect.');
          return false;
        }
      }, err => {
        console.log(err);
        return false;
      });
  }
  saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
  isAuthenticated(): boolean {
    if (localStorage.getItem('user')) {
      return true;
    } else {
      return false;
    }
  }
  isAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log(user._id);
    this.http.post<any>(`${this.host}/getRole`, user)
      .subscribe(res => {
        if (res.role === 'admin') {
          return true;
        } else {
          return false;
        }
      }, err => {
        console.log(err);
        return false;
      });
    return false;
  }
  destroySession() {
    localStorage.clear();
  }
  getName() {
    return JSON.parse(localStorage.getItem('user')).name;
  }
  getID() {
    return JSON.parse(localStorage.getItem('user'))._id;
  }
}
