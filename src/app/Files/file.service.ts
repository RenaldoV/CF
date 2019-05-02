import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {WINDOW} from '../window.service';
import {AuthService} from '../auth/auth.service';
import {Observable} from 'rxjs/index';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  host;
  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(WINDOW) private window: Window,
    private auth: AuthService
  ) {
    this.host = `${window.location.protocol}//${window.location.host}` + '/user';
  }
  createFile(file) {
    const uid = this.auth.getID();
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/addFile`, {file: file, uid: uid});
  }
  getMyFiles(archived) {
    const url = `${this.host}/files/` + archived;
    return this.http.get(url);
  }
  completeMilestone(file, milestone, notiProps?) {
    const uid = this.auth.getID(); // complete milestone as me
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/completeMilestone`,
      {fileID: file, milestoneID: milestone, uid: uid, notiProps: notiProps});
  }
  addComment(fileID, milestoneID, comment) {
    const uid = this.auth.getID();
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/addComment`, {
      fileID: fileID, milestoneID: milestoneID, uid: uid, comment: comment.comment,
      sendNoti: {sms : comment.sendSMS, email: comment.sendEmail},
      emailContacts: comment.emailContacts, smsContacts: comment.smsContacts
    });
  }
  addSummary(fileID, summary) {
    const uid = this.auth.getID();
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/addSummary`, {
      fileID: fileID, uid: uid, summary: summary.summary,
      sendNoti: {sms : summary.sendSMS, email: summary.sendEmail},
      emailContacts: summary.emailContacts, smsContacts: summary.smsContacts
    });
  }
  getFileRef(id): Observable<any> {
    const url = `${this.host}/fileRef/` + id;
    return this.http.get(url);
  }
  getFile(id) {
    const url = `${this.host}/file/` + id;
    return this.http.get<any>(url);
  }
  updateFile(f) {
    const uid = this.auth.getID();
    return this.http.post<any>(`${this.host}/updateFile`, {file: f, uid: uid});
  }
  getAllFileNames() {
    return this.http.get<any>(`${this.host}/allFileNames`, {});
  }

}
