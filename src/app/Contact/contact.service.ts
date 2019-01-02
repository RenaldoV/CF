import {Inject, Injectable} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {WINDOW} from '../window.service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/index';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private host;
  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService,
    @Inject(WINDOW) private window: Window,
  ) {
    this.host = 'http://' + window.location.hostname + ':4000/user';
  }

  getContact(id): Observable<any> {
    const url = `${this.host}/contact/` + id;
    return this.http.get(url);
  }

  registerContact(ct) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/registerContact`, ct);
  }

  login(ct) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/loginContact`, ct);
  }
  checkEmail(email) {
    return this.http.post(`${this.host}/checkEmailContact`, {email: email});
  }
  checkResetToken(token) {
    return this.http.post(`${this.host}/checkResetTokenContact`, {token: token});
  }
  updateForgotPassword(token, pw) {
    return this.http.post<any>(`${this.host}/updateForgotPasswordContact`, {passwordHash: pw, token: token});
  }
}
