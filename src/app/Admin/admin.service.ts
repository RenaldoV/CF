import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {WINDOW} from '../window.service';
import {AuthService} from '../auth/auth.service';

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
    this.http.post<any>(`${this.host}/addMilestones`, {milestones: milestones, listID: listID})
      .subscribe(res => {
        if (res) {
          console.log(res);
        } else {
          return res;
        }
      }, err => {
        console.log(err);
        return false;
      });
  }
  createList(list) {
    if (list.updatedBy === 'new') { // new list save to db
      list.updatedBy = this.auth.getID();
      list.milestones.forEach(m => {
        m.updatedBy = list.updatedBy;
      });
      const headers = new HttpHeaders();
      headers.set('Content-Type', 'application/json');
      this.http.post<any>(`${this.host}/addList`, list)
      .subscribe(res => {
        if (res) {
          this.createMilestones(list.milestones, res._id);

        } else {
          return res;
        }
      }, err => {
        console.log(err);
        return false;
      });
    } else if (list.updatedBy === 'updated') {

    } else {

    }
   /* lists.forEach(l => {
      if (l.updatedBy === 'new') {
        l.updatedBy = this.auth.getID();

      }
    });*/

  }
}
