import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AdminService} from '../admin.service';
import {LoaderService} from '../../Common/Loader';
import {FileService} from '../../Files/file.service';
import {Router} from '@angular/router';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {AddEntityDialogComponent} from '../../Entities/add-entity-dialog/add-entity-dialog.component';
import {AddContactDialogComponent} from '../../Contact/add-contact-dialog/add-contact-dialog.component';
@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    public loaderService: LoaderService,
    public fileService: FileService,
    private router: Router,
    private dialog: MatDialog
  ) {}
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
  addNewEntity() {
    const dialConfig = new MatDialogConfig();
    dialConfig.disableClose = true;
    dialConfig.autoFocus = true;
    const dialogRef = this.dialog.open(AddEntityDialogComponent, dialConfig);
    dialogRef.afterClosed().subscribe();
  }
  addNewContact() {
    const dialConfig = new MatDialogConfig();
    dialConfig.disableClose = true;
    dialConfig.autoFocus = true;
    const dialogRef = this.dialog.open(AddContactDialogComponent, dialConfig);
    dialogRef.afterClosed().subscribe();
  }

}
