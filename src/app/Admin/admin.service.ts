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
    console.log('Updating milestone to :' + m);
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
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/deleteList`, {lid: id, uid: this.auth.getID()});
  }
  userHasProperties() {
    const uid = this.auth.getID();
    const url = `${this.host}/hasProperties/` + uid;
    return this.http.get(url);
  }
  createProperties(p, uid) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/addProperties`, {properties: p, uid: uid});
  }
  getProperties(): Observable<any> {
    const uid = this.auth.getID();
    const url = `${this.host}/properties/` + uid;
    return this.http.get(url);
  }
  updateProperties(p) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/updateProperties`, {properties: p, uid: this.auth.getID()});
  }
  createContact(ct) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/addContact`, {contact: ct, uid: this.auth.getID()});
  }
  getContacts(): Observable<any> {
    const uid = this.auth.getID();
    const url = `${this.host}/contacts/` + uid;
    return this.http.get(url);
  }
  deleteContact(id) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/deleteContact`, {cid: id, uid: this.auth.getID()});
  }
}
