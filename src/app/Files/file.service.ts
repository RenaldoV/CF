import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {WINDOW} from '../window.service';
import {AuthService} from '../auth/auth.service';

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
    this.host = 'http://' + window.location.hostname + ':4000/user';
  }
  createFile(file) {
    const uid = this.auth.getID();
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/addFile`, {file: file, uid: uid});
  }
  getMyFiles() {
    const uid = this.auth.getID();
    const url = `${this.host}/files/` + uid;
    return this.http.get(url);
  }
  completeMilestone(fileID, milestoneID) {
    const uid = this.auth.getID();
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/completeMilestone`, {fileID: fileID, milestoneID: milestoneID, uid: uid});
  }
  addComment(fileID, milestoneID, comment) {
    const uid = this.auth.getID();
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/addComment`, {
      fileID: fileID, milestoneID: milestoneID, uid: uid, comment: comment
    });
  }

}
