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
import {RequiredDocumentsService} from '../required-documents.service';


@Component({
  selector: 'app-add-dialog-dialog',
  templateUrl: './add-required-document-dialog.component.html',
  styleUrls: ['./add-required-document-dialog.component.css']
})
export class AddRequiredDocumentDialogComponent implements OnInit {

  rdForm: FormGroup;
  allMilestones;
  allMilestoneList;
  existing = false;
  visible = true;
  selectable = true;
  removable = true;
  matcher = new ErrorStateMatcher();
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddRequiredDocumentDialogComponent>,
    public loaderService: LoaderService,
    public adminService: AdminService,
    private matSnack: MatSnackBar,
    private dialog: MatDialog,
    private rdService: RequiredDocumentsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.createForm();
    if (this.data) {
      if (this.data.milestoneList) {
        this.allMilestoneList = this.data.milestoneList;
      } else {
        this.getAllLists();
      }
    } else {
      this.getAllLists();
    }
  }

  ngOnInit() {
    if (this.data) {
      if (this.data.rd) {
        this.existing = true;
        this.name.setValue(this.data.rd.name);
        this.allMilestoneList.forEach(ml => {
          const ids = ml.milestones.map(m => m._id);
          if (ids.indexOf(this.data.rd.milestone._id) > - 1) {
            this.milestoneList.setValue(ml.title);
            this.selectMilestoneList({value: ml.title});
          }
        });
        const selectedMilestone = this.allMilestones.find(m => {
          return m._id === this.data.rd.milestone._id;
        });
        this.milestone.setValue(selectedMilestone._id);
        this._id.setValue(this.data.rd._id);
      }
    }
  }
  getAllLists() {
    this.adminService.getAllMilestoneLists()
      .subscribe(res => {
        if (res) {
          this.allMilestoneList = res;
        }
      });
  }
  createForm() {
    this.rdForm = this.fb.group({
      _id: [],
      name: ['', Validators.required],
      milestoneList: ['', Validators.required],
      milestone: ['', Validators.required]
    });
  }
  get name() {
    return this.rdForm.get('name');
  }
  get milestoneList() {
    return this.rdForm.get('milestoneList');
  }
  get milestone() {
    return this.rdForm.get('milestone');
  }
  get _id() {
    return this.rdForm.get('_id');
  }
  selectMilestoneList(e) {
    this.allMilestones = this.allMilestoneList.filter(ml => ml.title === e.value)[0].milestones;
  }
  close() {
    this.dialogRef.close();
  }
  addNew() {
    const rd = this.rdForm.value;
    delete rd.milestoneList;
    delete rd._id;
    this.rdService.createRequiredDocument(rd)
      .subscribe(res => {
        if (res) {
          this.matSnack.open('Required Document created successfully');
          this.dialogRef.close(res);
        } else {
          const sb = this.matSnack.open('Required Document not created successfully', 'retry');
          sb.onAction().subscribe(() => {
            this.addNew();
          });
        }
      }, err => {
        const sb = this.matSnack.open('Required Document not created successfully', 'retry');
        sb.onAction().subscribe(() => {
          this.addNew();
        });
        console.log(err);
      });
  }
  update() {
    const rd = this.rdForm.value;
    delete rd.milestoneList;
    this.rdService.updateRequiredDocument(rd)
      .subscribe(res => {
        if (res) {
          this.matSnack.open('Required Document updated successfully');
          this.dialogRef.close(res);
        } else {
          const sb = this.matSnack.open('Required Document not updated successfully', 'retry');
          sb.onAction().subscribe(() => {
            this.update();
          });
        }
      }, err => {
        const sb = this.matSnack.open('Required Document not updated successfully', 'retry');
        sb.onAction().subscribe(() => {
          this.update();
        });
        console.log(err);
      });
  }
}
