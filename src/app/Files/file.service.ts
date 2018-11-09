import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {WINDOW} from '../window.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  host;
  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(WINDOW) private window: Window
  ) {
    this.host = 'http://' + window.location.hostname + ':4000/user';
  }
}
