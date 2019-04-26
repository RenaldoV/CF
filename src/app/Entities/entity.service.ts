import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {WINDOW} from '../window.service';
import {AuthService} from '../auth/auth.service';
import {Observable} from 'rxjs/index';

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  host;
  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(WINDOW) private window: Window,
    private auth: AuthService
  ) {
    this.host = `${window.location.protocol}//${window.location.host}` + '/user';
  }
  createEntity(e) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.host}/addEntity`, {entity: e});
  }
  getAllEntities() {
    return this.http.get<any>(`${this.host}/entities`);
  }
  deleteEntity(id) {
    return this.http.delete<any>(`${this.host}/entity/${id}`);
  }
  updateEntity(e) {
    return this.http.post<any>(`${this.host}/updateEntity`, {entity: e});
  }
  entityExists(eName) {
    return this.http.post<boolean>(`${this.host}/entityExists`, {name: eName});
  }
  entityNames() {
    return this.http.get<any>(`${this.host}/entityNames`);
  }
  removeFileFromEntity(eId, fId) {
    return this.http.post<boolean>(`${this.host}/removeFileFromEntity`, {eId: eId, fId: fId});
  }
  addFileToEntity(eId, fId) {
    return this.http.post<boolean>(`${this.host}/addFileToEntity`, {eId: eId, fId: fId});
  }
  getEntity(id) {
    return this.http.get<any>(`${this.host}/entity/${id}`);
  }
  getEntityAndFiles(eId) {
    return this.http.post<any>(`${this.host}/getEntity`, {eId: eId});
  }
}
