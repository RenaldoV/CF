import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {WINDOW} from '../window.service';
import {AuthService} from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  host;
  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(WINDOW) private window: Window,
    private auth: AuthService
  ) {
    this.host = `${window.location.protocol}//${window.location.host}` + '/user';
  }
  getContactUploads(contactID) {
    const url = `${this.host}/contactUploads/` + contactID;
    return this.http.get<any>(url);
  }
  getAllUploadsFile() {
    const url = `${this.host}/getAllUploads`;
    return this.http.get<any>(url);
  }
  download(d) {
    return this.http.post(`${this.host}/download`, {doc: d}, {
      responseType: 'blob'
    });
  }
}
