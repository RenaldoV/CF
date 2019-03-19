import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component, OnChanges, OnInit, ElementRef, ViewChild} from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { AdminService } from '../../Admin/admin.service';
import { CdkDragDrop , moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import {
  MatDialog,
  MatDialogConfig,
  MatSnackBar,
  MatAutocompleteSelectedEvent,
  MatChipInputEvent,
  MatAutocomplete, MatAutocompleteTrigger, ErrorStateMatcher
} from '@angular/material';
import {AddContactDialogComponent} from '../../Contact/add-contact-dialog/add-contact-dialog.component';
import {LoaderService} from '../../Common/Loader';
import {FileService} from '../file.service';
import {ContactService} from '../../Contact/contact.service';

@Component({
  selector: 'app-add-file',
  templateUrl: './add-file.component.html',
  styleUrls: ['./add-file.component.css']
})
export class AddFileComponent implements OnInit {
  file;
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
  // Chips autocomplete
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredSecretaries: Observable<any[]>;
  allSecretaries: any[] = [];
  secretaries: any[] = [];
  matcher = new ErrorStateMatcher();
  milestoneOpenState;
  @ViewChild('secInput') secretaryInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') secretaryAutoComp: MatAutocomplete;
  @ViewChild(MatAutocompleteTrigger) secInput: MatAutocompleteTrigger;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private adminService: AdminService,
    private contactService: ContactService,
    private fileService: FileService,
    private dialog: MatDialog,
    private matSnack: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    public loaderService: LoaderService
  ) {
    this.createFileForm();
    this.createPropertyForm();
    this.auth.getUserNames()
      .subscribe(res => {
        if (res) {
          this.secretaries = res.filter(s => s.name === this.auth.getName());
          this.allSecretaries = res;
          if (!this.route.snapshot.paramMap.get('id')) {
            this.secChips.setValue(this.secretaries);
          }
        }
      }, err => {
        console.log(err);
      });
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
    this.contactService.searchContacts(this.searchTerm$)
      .subscribe(res => {
        this.filteredContacts = [];
        res.forEach(ct => {
          if (this.fileContactsList.map(c => c.email).indexOf(ct.email) === -1) {
            this.filteredContacts.push(ct);
          }
        });
      });
    this.filteredSecretaries = this.refUser.valueChanges.pipe(
      startWith(null),
      map((sec: string | null) => sec ? this._filterSecretaries(sec) : this._filterSecretaries('')));
  }
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    // patch the form
    if (id) {
      this.fileService.getFile(id)
        .subscribe(res => {
          if (res) {
            this.file = res;
            this.propForm.patchValue(this.file);
            this.fileRef.setValue(this.file.fileRef);
            this.milestoneList.setValue(this.file.milestoneList._id._id);
            this.secretaries = this.file.refUser.map(s => ({name: s.name, _id: s._id}));
            this.secChips.setValue(this.secretaries);
            if (this.file.bank) {
              this.bank.setValue(this.file.bank);
            }
            this.fileContactsList = this.file.contacts;
          }
        }, (err) => {
          console.log(err);
        });
    }
  }
  showRoute() {
    if (this.route.snapshot.paramMap.get('id')) {
      return 'Edit File';
    } else {
      return 'Add File';
    }
  }
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
      refUser: [''],
      secChips: ['', Validators.required],
      milestoneList: ['', Validators.required],
      bank: ['']
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
  get secChips () {
    return this.fileForm.get('secChips');
  }
  get milestoneList () {
    return this.fileForm.get('milestoneList');
  }
  get bank () {
    return this.fileForm.get('bank');
  }
  milestoneListSelected(e) {
    const ms = this.milestonesLists.filter(m => m._id === e);
    if (ms[0].title === 'Bond') {
      this.bank.setValidators([Validators.required]);
      this.bank.updateValueAndValidity();
    } else {
      this.bank.clearValidators();
      this.bank.updateValueAndValidity();
    }
  }
  isBond() {
    const ms = this.milestonesLists.filter(m => m._id === this.milestoneList.value);
    if (ms[0]) {
      if (ms[0].title === 'Bond') {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
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
    const dialogRef = this.dialog.open(AddContactDialogComponent, dialConfig);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.fileContactsList.push(res);
      }
    });
  }
  // TODO: add guard to prevent user navigating away if form is Dirty.
  // Chips autocomplete functions
  remove(sec): void {
    const index = this.secretaries.indexOf(sec);

    if (index >= 0) {
      this.secretaries.splice(index, 1);
      this.secChips.setValue(this.secretaries);
    }
  }
  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedSec = {_id: event.option.value, name: event.option.viewValue};
    this.secretaries.push(selectedSec);
    this.secretaryInput.nativeElement.value = '';
    this.refUser.setValue(null);
    this.secChips.setValue(this.secretaries);
  }
  private _filterSecretaries(value: string): string[] {
    const secNames = this.secretaries.map(s => s.name);
    const filterValue = value.toLowerCase();
    return this.allSecretaries.filter(sec => sec.name.toLowerCase().indexOf(filterValue) === 0 && secNames.indexOf(sec.name) === -1);
  }
  onFocus() {
    this.secInput._onChange('');
    this.secInput.openPanel();
  }
  submitFile() {
    if (this.route.snapshot.paramMap.get('id')) {
      this.updateFile();
    } else {
      if (this.propForm.valid && this.fileForm.valid) {
        this.propForm.value.refUser = this.secretaries.map(s => s._id);
        delete this.propForm.value.secChips;
        const file = {...this.fileForm.value, ...this.propForm.value, ...{'contacts': this.fileContactsList.map(ct => ct._id)}};
        this.fileService.createFile(file)
          .subscribe(res => {
            if (res) {
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
  updateFile() {
    if (this.propForm.valid && this.fileForm.valid) {
      this.propForm.value.refUser = this.secretaries.map(s => s._id);
      delete this.propForm.value.secChips;
      const file = {_id: this.route.snapshot.paramMap.get('id'), ...this.fileForm.value, ...this.propForm.value, ...{'contacts': this.fileContactsList.map(ct => ct._id)}};
      console.log(file);
      this.fileService.updateFile(file)
        .subscribe(res => {
          if (res) {
            const sb = this.matSnack.open('File updated successfully', 'Ok');
            sb.onAction().subscribe(() => {
              this.router.navigate(['/admin-home']);
            });
            sb.afterDismissed().subscribe(() => {
              this.router.navigate(['/admin-home']);
            });
          } else {
            const sb = this.matSnack.open('Update unsuccessful', 'retry');
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
