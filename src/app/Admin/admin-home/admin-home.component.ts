import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AdminService} from '../admin.service';
import {LoaderService} from '../../Common/Loader';
import {FileService} from '../../Files/file.service';
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
    public loaderService: LoaderService,
    public fileService: FileService
  ) {
    this.fileService.getMyFiles()
      .subscribe(res => {
        console.log(res);
          this.files = res;
      }, err => {
        console.log(err);
      });
  }

  ngOnInit() {
  }

}
