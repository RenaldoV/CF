import {Component, OnChanges, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Observable, Subject} from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { AdminService } from '../../Admin/admin.service';
import { CdkDragDrop , moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import {MatDialog, MatDialogConfig, MatSnackBar} from '@angular/material';
import {AddContactDialogComponent} from '../add-contact-dialog/add-contact-dialog.component';
import {Router} from '@angular/router';
import {LoaderService} from '../../Loader';
import {FileService} from '../file.service';

@Component({
  selector: 'app-add-file',
  templateUrl: './add-file.component.html',
  styleUrls: ['./add-file.component.css']
})
export class AddFileComponent implements OnInit {
  fileForm: FormGroup;
  propForm: FormGroup;
  /*propTypes: String[] = [];
  filteredProps: Observable<any[]>;
  actionTypes: String[] = [];
  filteredActions: Observable<any[]>;*/
  deedsOffices: String[] = [];
  filteredDeeds: Observable<any[]>;
  milestonesLists: any[] = [];
  filteredContacts: any[] = [];
  fileContactsList: any[] = [];
  searchTerm$ = new Subject<string>();
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private adminService: AdminService,
    private fileService: FileService,
    private dialog: MatDialog,
    private matSnack: MatSnackBar,
    private router: Router,
    public loaderService: LoaderService
  ) {
    this.createFileForm();
    this.createPropertyForm();
    this.adminService.getProperties()
      .subscribe(res => {
        if (res) {
          /*this.propTypes = res.propertyTypes;
          this.actionTypes = res.actionTypes;*/
          this.deedsOffices = res.deedsOffices;
          // ======= Autocomplete Filters =============
          /*this.filteredProps = this.propType.valueChanges
            .pipe(
              startWith(''),
              map(prop => prop ? this.filterProps(prop) : this.propTypes.slice())
            );
          this.filteredActions = this.action.valueChanges
            .pipe(
              startWith(''),
              map(ac => ac ? this.filterActions(ac) : this.actionTypes.slice())
            );*/
          this.filteredDeeds = this.deedsOffice.valueChanges
            .pipe(
              startWith(''),
              map(d => d ? this.filterDeeds(d) : this.deedsOffices.slice())
            );
          // ======= Autocomplete Filters =============
        } else {
          this.filteredDeeds = this.deedsOffice.valueChanges
            .pipe(
              startWith(''),
              map(d => d ? this.filterDeeds(d) : this.deedsOffices.slice())
            );
        }
      }, err => {
        console.log(err);
      });
    this.adminService.getAllMilestoneLists()
      .subscribe(res => {
        if (res) {
          this.milestonesLists = res;
        }
      }, err => {
        console.log(err);
      });
    this.adminService.searchContacts(this.searchTerm$)
      .subscribe(res => {
        this.filteredContacts = [];
        res.forEach(ct => {
          if (this.fileContactsList.map(c => c.email).indexOf(ct.email) === -1) {
            this.filteredContacts.push(ct);
          }
        });
      });
    // TODO: get all my contact initially
  }
  ngOnInit() {}
  // ======= File Form functions ===============

    // ====auto complete functions=======
  /*filterProps(val: string) {
    let results = this.propTypes.filter(prop =>
      prop.toLowerCase().indexOf(val.toLowerCase()) === 0);
    if (results.length < 1) {
      results = ['Would you like to add *' + val + '* to Property Types?'];
    }
    return results;
  }
  propTypeSelected(option) {
    if (option.value.indexOf('Would you like to add') > - 1) {
      const newState = option.value.split('*')[1];
      this.adminService.addOnePropType(newState)
        .subscribe(res => {
          if (res) {
            this.propTypes.push(newState);
            this.propType.setValue(newState);
            this.matSnack.open('Property type successfully saved');
          } else {
            const sb = this.matSnack.open('Save unsuccessful', 'retry');
            sb.onAction().subscribe(() => {
              this.propTypeSelected(option);
            });
          }
        }, err => {
          const sb = this.matSnack.open('Save unsuccessful', 'retry');
          sb.onAction().subscribe(() => {
            this.propTypeSelected(option);
          });
          console.log(err);
        });
    }
  }*/
  /*filterActions(val: string) {
    let results = this.actionTypes.filter(ac =>
      ac.toLowerCase().indexOf(val.toLowerCase()) === 0);
    if (results.length < 1) {
      results = ['Would you like to add *' + val + '* to Action Types?'];
    }
    return results;
  }
  actionTypeSelected(option) {
    if (option.value.indexOf('Would you like to add') > - 1) {
      const newState = option.value.split('*')[1];
      this.adminService.addOneAction(newState)
        .subscribe(res => {
          if (res) {
            this.actionTypes.push(newState);
            this.action.setValue(newState);
            this.matSnack.open('Cause of Action successfully saved');
          } else {
            const sb = this.matSnack.open('Save unsuccessful', 'retry');
            sb.onAction().subscribe(() => {
              this.actionTypeSelected(option);
            });
          }
        }, err => {
          const sb = this.matSnack.open('Save unsuccessful', 'retry');
          sb.onAction().subscribe(() => {
            this.actionTypeSelected(option);
          });
          console.log(err);
        });
    }
  }*/
  filterDeeds(val: string) {
    let results = this.deedsOffices.filter(d =>
      d.toLowerCase().indexOf(val.toLowerCase()) === 0);
    if (results.length < 1) {
      results = ['Would you like to add *' + val + '* to Deeds Offices?'];
    }
    return results;
  }
  deedsSelected(option) {
    if (option.value.indexOf('Would you like to add') > - 1) {
      const newState = option.value.split('*')[1];
      this.deedsOffice.setValue(newState);
      this.adminService.addOneDeedsOffice(newState)
        .subscribe(res => {
          if (res) {
            this.deedsOffices.push(newState);
            this.matSnack.open('Deeds office successfully saved');
          } else {
            this.deedsOffice.setValue('');
            const sb = this.matSnack.open('Save unsuccessful', 'retry');
            sb.onAction().subscribe(() => {
              this.deedsSelected(option);
            });
          }
        }, err => {
          const sb = this.matSnack.open('Save unsuccessful', 'retry');
          sb.onAction().subscribe(() => {
            this.deedsSelected(option);
          });
          console.log(err);
        });
    }
  }
    // ====auto complete functions=======
  createFileForm() {
    this.fileForm = this.fb.group({
      fileRef: ['', Validators.required],
      /*action: ['', Validators.required],*/
      refUser: [this.auth.getName(), Validators.required],
      milestoneList: ['', Validators.required] // TODO: get milestone lists from DB
    });
  }
  get fileRef () {
    return this.fileForm.get('fileRef');
  }
  /*get action () {
    return this.fileForm.get('action');
  }*/
  get refUser () {
    return this.fileForm.get('refUser');
  }
  get milestoneList () {
    return this.fileForm.get('milestoneList');
  }
  // ======= File Form functions ===============
  // ======= Property Form functions ===============
  createPropertyForm() {
    this.propForm = this.fb.group({
      deedsOffice: ['', Validators.required],
      propertyDescription: ['', Validators.required]
      /*propType: ['', Validators.required],
      erfNumber: ['', Validators.required],
      portionNum: ['', Validators.required]*/
    });
  }
  get deedsOffice () {
    return this.propForm.get('deedsOffice');
  }
  get propertyDescription () {
    return this.propForm.get('propertyDescription');
  }
  /*get erfNumber () {
    return this.propForm.get('erfNumber');
  }
  get portionNum () {
    return this.propForm.get('portionNum');
  }
  get propType () {
    return this.propForm.get('propType');
  }*/
  // ======= Property Form functions ===============
  // ======= Contacts Form functions ===============
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }
  createNewContactDialog() {
    const dialConfig = new MatDialogConfig();
    dialConfig.disableClose = true;
    dialConfig.autoFocus = true;
    dialConfig.minWidth = 300;
    const dialogRef = this.dialog.open(AddContactDialogComponent, dialConfig);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.fileContactsList.push(res);
      }
    });
  }
  // TODO: add guard to prevent user navigating away if form is Dirty.

  submitFile() {
    if (this.propForm.valid && this.fileForm.valid) {
      const file = {...this.fileForm.value, ...this.propForm.value, ...{'contacts': this.fileContactsList.map(ct => ct._id)}};
      this.fileService.createFile(file)
        .subscribe(res => {
          if (file) {
            const sb = this.matSnack.open('File saved successfully', 'Ok');
            sb.onAction().subscribe(() => {
              this.router.navigate(['/admin-home']);
            });
            sb.afterDismissed().subscribe(() => {
              this.router.navigate(['/admin-home']);
            });
          } else {
            const sb = this.matSnack.open('Save unsuccessful', 'retry');
            sb.onAction().subscribe(() => {
              this.submitFile();
            });
          }
        });
    } else {
      this.matSnack.open('Please check that all data is valid');
    }
  }
}
