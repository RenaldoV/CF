import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {WINDOW} from '../window.service';
import {AuthService} from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RequiredDocumentsService {
  host;
  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(WINDOW) private window: Window,
    private auth: AuthService
  ) {
    this.host = 'http://' + window.location.hostname + ':4000/user';
  }
  createRequiredDocument(rd) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/createRequiredDocument`, {rd: rd});
  }
  updateRequiredDocument(rd) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/updateRequiredDocument`, {rd: rd});
  }
  deleteRequiredDocument(id) {
    return this.http.delete<any>(`${this.host}/requiredDocument/${id}`);
  }
  getllReqDocs() {
    return this.http.get<any>(`${this.host}/requiredDocuments`);
  }
}
