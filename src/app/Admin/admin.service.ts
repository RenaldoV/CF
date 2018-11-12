import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {WINDOW} from '../window.service';
import {AuthService} from '../auth/auth.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private host;

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService,
    @Inject(WINDOW) private window: Window,
  ) {
    this.host = 'http://' + window.location.hostname + ':4000/user';
  }

  createMilestones(milestones, listID) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/addMilestones`, {milestones: milestones, listID: listID});
  }

  createNewList(list) {
      const headers = new HttpHeaders();
      headers.set('Content-Type', 'application/json');
      return this.http.post<any>(`${this.host}/addList`, list);
  }

  getAllMilestoneLists(): Observable<any> {
    const url = `${this.host}/list`;
    return this.http.get(url);
  }
  getMilestoneList(id): Observable<any> {
    const url = `${this.host}/lists/` + id;
    return this.http.get(url);
  }
  deleteMilestone(id, listID) {
    return this.http.post<any>(`${this.host}/deleteMilestone`, {id: id, listID: listID});
  }
}
