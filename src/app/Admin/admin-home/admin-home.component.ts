import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AdminService} from '../admin.service';
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
    private adminService: AdminService
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
