import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AdminService} from '../admin.service';
import {LoaderService} from '../../Common/Loader';
import {FileService} from '../../Files/file.service';
import {Router} from '@angular/router';
@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {
  files;
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    public loaderService: LoaderService,
    public fileService: FileService,
    private router: Router
  ) {
    this.fileService.getMyFiles()
      .subscribe(res => {
        // console.log(res);
          this.files = res;
      }, err => {
        console.log(err);
      });
  }
  showRoute() {
    let route = this.router.url.replace('/', '').replace('-', ' ');
    route = route.toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');
    return route;
  }

  ngOnInit() {
  }

}
