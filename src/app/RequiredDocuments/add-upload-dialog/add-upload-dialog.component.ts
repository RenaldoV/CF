import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {
  ErrorStateMatcher,
  MAT_DIALOG_DATA,
  MatAutocomplete,
  MatAutocompleteSelectedEvent, MatAutocompleteTrigger, MatDialog, MatDialogConfig,
  MatDialogRef,
  MatSnackBar
} from '@angular/material';
import {LoaderService} from '../../Common/Loader';
import {AdminService} from '../../Admin/admin.service';


@Component({
  selector: 'app-add-dialog-dialog',
  templateUrl: './add-upload-dialog.component.html',
  styleUrls: ['./add-upload-dialog.component.css']
})
export class AddUploadDialogComponent implements OnInit {

  uploadForm: FormGroup;
  allMilestones;
  allMilestoneList;
  existing = false;
  visible = true;
  selectable = true;
  removable = true;
  matcher = new ErrorStateMatcher();
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddUploadDialogComponent>,
    public loaderService: LoaderService,
    public adminService: AdminService,
    private matSnack: MatSnackBar,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data) {
      if (this.data.milestoneList) {
        this.allMilestoneList = this.data.milestoneList;
      } else {
        this.getAllLists();
      }
    } else {
      this.getAllLists();
    }
    this.createForm();
  }

  ngOnInit() {
  }
  getAllLists() {
    this.adminService.getAllMilestoneLists()
      .subscribe(res => {
        if (res) {
          console.log(res);
          this.allMilestoneList = res;
        }
      });
  }
  createForm() {
    this.uploadForm = this.fb.group({
      _id: [],
      name: ['', Validators.required],
      milestoneList: ['', Validators.required],
      milestone: ['', Validators.required]
    });
  }
  get name() {
    return this.uploadForm.get('name');
  }
  get milestoneList() {
    return this.uploadForm.get('milestoneList');
  }
  get milestone() {
    return this.uploadForm.get('milestone');
  }
  get _id() {
    return this.uploadForm.get('_id');
  }
  selectMilestoneList(e) {
    console.log(e);
  }
}
