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
import {LoaderService} from '../../Common/Loader/index';
import {AdminService} from '../../Admin/admin.service';
import {GlobalValidators} from '../../Common/Validators/globalValidators';
import {ContactService} from '../../Contact/contact.service';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Observable} from 'rxjs/index';
import {AddContactDialogComponent} from '../../Contact/add-contact-dialog/add-contact-dialog.component';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-add-entity-dialog',
  templateUrl: './add-entity-dialog.component.html',
  styleUrls: ['./add-entity-dialog.component.css']
})
export class AddEntityDialogComponent implements OnInit {

  entityForm: FormGroup;
  existing = false;
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredContacts: Observable<any[]>;
  allContacts: any[] = [];
  contactsForEntities: any[] = [];
  matcher = new ErrorStateMatcher();
  @ViewChild('conPersonInput') conPersonInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') conPersonAutoComp: MatAutocomplete;
  @ViewChild(MatAutocompleteTrigger) conInput: MatAutocompleteTrigger;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEntityDialogComponent>,
    public loaderService: LoaderService,
    private adminService: AdminService,
    private contactService: ContactService,
    private matSnack: MatSnackBar,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data.entity) {
      this.existing = true;
    }
    if (this.data.allContacts) {
      this.allContacts = this.data.allContacts;
    } else {
      this.getContacts();
    }
    this.createEntityForm();
  }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }
  getContacts() {
    this.contactService.getContacts()
      .subscribe(res => {
        if (res) {
          this.allContacts = res.map(c => {
            return {
              name: c.name + ' ' + c.surname,
              _id: c._id
            };
          });
          this.filteredContacts = this.contacts.valueChanges.pipe(
            startWith(null),
            map((con: string | null) => con ? this._filteredContacts(con) : this._filteredContacts('')));
        }
      }, err => {
        console.log(err);
      });
  }
  createEntityForm() {
    this.entityForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      telephone: ['', [Validators.required, GlobalValidators.cellRegex]],
      contacts: ['', Validators.required], // array of contact ids
      conPersChips: ['', Validators.required], // used for chips control
      website: ['', Validators.required],
      files: [''],
      updatedBy: [this.existing ? 'existing' : 'new']
    });
  }
  get name() {
    return this.entityForm.get('name');
  }
  get address() {
    return this.entityForm.get('address');
  }
  get telephone() {
    return this.entityForm.get('telephone');
  }
  get conPersChips() {
    return this.entityForm.get('conPersChips');
  }
  get website() {
    return this.entityForm.get('website');
  }
  get files() {
    return this.entityForm.get('files');
  }
  get contacts() {
    return this.entityForm.get('contacts');
  }
  private _filteredContacts(value: string): string[] {
    const conNames = this.contactsForEntities.map(c => c.name);
    const filterValue = value.toLowerCase();
    let results = this.allContacts.filter(con => con.name.toLowerCase().indexOf(filterValue) === 0 && conNames.indexOf(con.name) === -1);
    if (results.length < 1) { // contact doesn't exist create new one.
      results = [{name: 'Would you like to add *' + value + '* as a new contact?', _id: 'new'}];
    }
    return results;
  }
  removeContactPerson(sec, i): void {
    const index = this.contactsForEntities.indexOf(sec);

    if (index >= 0) {
      this.contactsForEntities.splice(index, 1);
      this.conPersChips.setValue(this.contactsForEntities);
    }
    if (this.conPersChips.value.length < 1) {
      // no contacts chosen show error
      this.contacts.setValidators(Validators.required);
      this.contacts.updateValueAndValidity();
    }
  }
  selectedContactPerson(event: MatAutocompleteSelectedEvent): void {
    const selectedCon = {_id: event.option.value, name: event.option.viewValue};
    if (selectedCon._id === 'new') { // contact doesn't exist, create new
      const contactArr = selectedCon.name.split('*');
      const nameArr = contactArr[1].split(' ');
      const contact = {
        name: nameArr[0],
        surname: nameArr.length > 1 ? nameArr[1] : ''
      };
      this.createNewContactDialog(contact);
    } else {
      this.contactsForEntities.push(selectedCon);
      this.conPersonInput.nativeElement.value = '';
      this.contacts.setValue(null);
      this.conPersChips.setValue(this.contactsForEntities);
      this.contacts.clearValidators();
      this.contacts.updateValueAndValidity();
    }
  }
  onFocus() {
    this.conInput._onChange('');
    this.conInput.openPanel();
  }
  createNewContactDialog(contact) {
    const dialConfig = new MatDialogConfig();
    dialConfig.disableClose = true;
    dialConfig.autoFocus = true;
    dialConfig.data = contact;
    const dialogRef = this.dialog.open(AddContactDialogComponent, dialConfig);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.allContacts.push(res);
        this.contactsForEntities.push({
          name: res.name,
          _id: res._id
        });
        this.conPersonInput.nativeElement.value = '';
        this.contacts.setValue(null);
        this.conPersChips.setValue(this.contactsForEntities);
        this.contacts.clearValidators();
        this.contacts.updateValueAndValidity();
      }
    });
  }
  submitEntity() {
  }
  updateEntity() {
  }
}
