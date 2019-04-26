import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {WINDOW} from '../window.service';
import {AuthService} from '../auth/auth.service';
import {Observable} from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

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
    this.host = `${window.location.protocol}//${window.location.host}` + '/user';
  }

  createMilestones(milestones, listID) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/addMilestones`, {milestones: milestones, listID: listID});
  }
  createMilestone(m, listID) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/addMilestone`, {m: m, listID: listID});
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
  updateMilestone(m) {
    return this.http.post<Boolean>(`${this.host}/updateMilestone`, m);
  }
  createNewList(list) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/addList`, list);
  }
  updateList(list) {
    delete list.milestones;
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/updateList`, list);
  }
  deleteList(id) {
    let uid;
    if (this.auth.isTopLevelUser()) {
      uid = this.auth.getID();
    } else {
      console.log('not top level admin, my admin ID: ' + this.auth.getAdminID());
      uid = this.auth.getAdminID();
    }
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/deleteList`, {lid: id, uid: uid});
  }
  userHasProperties() {
    let uid;
    if (this.auth.isTopLevelUser()) {
      uid = this.auth.getID();
    } else {
      console.log('not top level admin, my admin ID: ' + this.auth.getAdminID());
      uid = this.auth.getAdminID();
    }
    const url = `${this.host}/hasProperties/` + uid;
    return this.http.get(url);
  }
  createProperties(p) {
    let uid;
    if (this.auth.isTopLevelUser()) {
      uid = this.auth.getID();
    } else {
      console.log('not top level admin, my admin ID: ' + this.auth.getAdminID());
      uid = this.auth.getAdminID();
    }
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/addProperties`, {properties: p, uid: uid});
  }
  getProperties(): Observable<any> {
    let uid;
    if (this.auth.isTopLevelUser()) {
      uid = this.auth.getID();
    } else {
      uid = this.auth.getAdminID();
    }
    const url = `${this.host}/properties/` + uid;
    return this.http.get(url);
  }
  updateProperties(p) {
    let uid;
    if (this.auth.isTopLevelUser()) {
      uid = this.auth.getID();
    } else {
      uid = this.auth.getAdminID();
    }
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/updateProperties`, {properties: p, uid: uid});
  }
  /*addOneAction(a) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/addOneActionProperty`, {action: a, uid: this.auth.getID()});
  }
  addOnePropType(p) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/addOnePropType`, {propertyType: p, uid: this.auth.getID()});
  }*/
  addOneDeedsOffice(d) {
    let uid;
    if (this.auth.isTopLevelUser()) {
      uid = this.auth.getID();
    } else {
      console.log('not top level admin, my admin ID: ' + this.auth.getAdminID());
      uid = this.auth.getAdminID();
    }
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/addOneDeedsOffice`, {deedsOffice: d, uid: uid});
  }
  getSmsCredits(): Observable<any> {
    return this.http.get<any>(`${this.host}/getSmsCredits`);
  }
}
