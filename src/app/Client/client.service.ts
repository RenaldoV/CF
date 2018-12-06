import {Inject, Injectable} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {IUser} from '../../interfaces/IUser';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {WINDOW} from '../window.service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/index';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private host;
  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService,
    @Inject(WINDOW) private window: Window,
  ) {
    this.host = 'http://' + window.location.hostname + ':4000/user';
  }

  getClient(id): Observable<any> {
    console.log('getting client');
    const url = `${this.host}/contact/` + id;
    return this.http.get(url);
  }
}
