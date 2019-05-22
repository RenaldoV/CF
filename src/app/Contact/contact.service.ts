import {Inject, Injectable} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {WINDOW} from '../window.service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/index';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';

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
    this.host = `${window.location.protocol}//${window.location.host}` + '/user';
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
  createContact(ct) {
    let uid;
    if (this.auth.isTopLevelUser()) {
      uid = this.auth.getID();
    } else {
      uid = this.auth.getAdminID();
    }
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/addContact`, {contact: ct, uid: uid});
  }
  getContacts(): Observable<any> {
    let uid;
    if (this.auth.isTopLevelUser()) {
      uid = this.auth.getID();
    } else {
      uid = this.auth.getAdminID();
    }
    const url = `${this.host}/contacts/` + uid;
    return this.http.get(url);
  }
  getAllContactNames() {
    const url = `${this.host}/contactNames`;
    return this.http.get<any>(url);
  }
  getContactByEmail(email): Observable<any> {
    let uid;
    if (this.auth.isTopLevelUser()) {
      uid = this.auth.getID();
    } else {
      uid = this.auth.getAdminID();
    }
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/contact`, {email: email, uid: uid});
  }
  deleteContact(id) {
    let uid;
    if (this.auth.isTopLevelUser()) {
      uid = this.auth.getID();
    } else {
      uid = this.auth.getAdminID();
    }
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/deleteContact`, {cid: id, uid: uid});
  }
  updateContact(ct) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/updateContact`, ct);
  }
  searchContacts(terms: Observable<string>)  {
    return terms
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap(term => this.searchEntries(term))
      );
  }
  searchEntries(term): Observable<any[]> {
    const url = `${this.host}/searchContacts`;
    return this.http.post<any[]>(url, {searchTerm: term});
  }
}
