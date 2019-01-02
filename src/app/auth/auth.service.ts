import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { WINDOW } from '../window.service';
import { IUser } from '../../interfaces/IUser';
import {Observable} from 'rxjs';

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
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/addUser`, user);
  }
  getUserByEmail(email): Observable<any> {
    const url = `${this.host}/userByEmail/` + email;
    return this.http.get(url);
  }
  getUsers() { // todo: make company field  single point of reference on front and backend
    const url = `${this.host}/users/` + this.getID();
    return this.http.get(url);
  }
  checkEmail(email) {
    return this.http.post(`${this.host}/checkEmailUser`, {email: email});
  }
  checkResetToken(token) {
    return this.http.post(`${this.host}/checkResetToken`, {token: token});
  }
  updateForgotPassword(token, pw) {
    return this.http.post<any>(`${this.host}/updateForgotPassword`, {passwordHash: pw, token: token});
  }
  getUserById(id): Observable<any> { // get non top level user by id
    const url = `${this.host}/user/` + id;
    return this.http.get(url);
  }
  updateUser(user) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/updateUser`, user);
  }
  deleteUser(id) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/deleteUser`, {id: id});
  }
  isTopLevelUser() {
    return !!JSON.parse(localStorage.getItem('user')).company; // TODO: check this on backend for more security
  }
  loginUser (user) {
    console.log('logging in user: ' + user);
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    this.http.post<any>(`${this.host}/login`, user)
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
  register(user) {
    console.log(user);
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/updateUser`, user)
      .subscribe(res => {
        if (res) {
          delete res.role;
          delete res.files;
          delete res.passwordHash;
          delete res.milestoneLists;
          delete res.contacts;
          delete res.verified;
          this.saveUser(res);
          this.router.navigate(['admin-home']);
        }
      });
  }
  saveUser(user) {
    this.destroySession();
    localStorage.setItem('user', JSON.stringify(user));
  }
  isAuthenticated(): boolean {
    if (localStorage.getItem('user')) {
      return true;
    } else {
      return false;
    }
  }
  isAdmin() {
    return new Promise((resolve, reject) => {
      const user = JSON.parse(localStorage.getItem('user'));
      this.http.post<any>(`${this.host}/getRole`, user)
        .toPromise()
        .then(res => {
          if (res.role === 'admin') {
            resolve(res.role === 'admin');
          } else {
            reject();
          }
        }, err => {
          console.log(err);
          return false;
        });
    });
  }
  isContact() {
    return !!JSON.parse(localStorage.getItem('user')).type;
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
  getUser() {
    return JSON.parse(localStorage.getItem('user'));
  }
  getAdminID() {
    return JSON.parse(localStorage.getItem('user')).companyAdmin;
  }
}
