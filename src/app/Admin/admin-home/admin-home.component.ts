import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AdminService} from '../admin.service';
import {LoaderService} from '../../Loader';
@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {
  filterForm: FormGroup;
  files;
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    public loaderService: LoaderService
  ) {
    this.adminService.getMyFiles()
      .subscribe(res => {
        this.files = res;
      }, err => {
        console.log(err);
      });
  }

  ngOnInit() {
  }

}
