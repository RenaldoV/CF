import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {AdminService} from '../admin.service';
import {LoaderService} from '../../Common/Loader';
import {AuthService} from '../../auth/auth.service';
import {
  ErrorStateMatcher,
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
  MatDialog, MatDialogConfig,
  MatSnackBar
} from '@angular/material';
import {GlobalValidators} from '../../Common/Validators/globalValidators';
import {Router} from '@angular/router';
import {ContactService} from '../../Contact/contact.service';
import {EntityService} from '../../Entities/entity.service';
import {Observable, Subject} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {AddContactDialogComponent} from '../../Contact/add-contact-dialog/add-contact-dialog.component';
import {AddEntityDialogComponent} from '../../Entities/add-entity-dialog/add-entity-dialog.component';
import {AddRequiredDocumentDialogComponent} from '../../RequiredDocuments/add-required-document-dialog/add-required-document-dialog.component';
import {RequiredDocumentsService} from '../../RequiredDocuments/required-documents.service';
import {animate, animateChild, query, stagger, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-admin-setup',
  templateUrl: './admin-setup.component.html',
  styleUrls: ['./admin-setup.component.css'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [ // each time the binding value changes
        query(':leave', [
          stagger(100, [
            animate('0.5s', style({ opacity: 0 }))
          ])
        ], { optional: true }),
        query(':enter', [
          style({ opacity: 0 }),
          stagger(100, [
            animate('0.5s', style({ opacity: 1 }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class AdminSetupComponent implements OnInit {
  MilestoneListForm: FormGroup;
  allLists;
  PropertiesForm: FormGroup;
  UsersForm: FormGroup;
  EmailPropsForm: FormGroup;
  origContacts;
  contactsCount = 0;
  // Used for dropdown on entity form
  visible = true;
  allContacts: any[] = [];
  allEntities: any[] = [];
  allRDs: any[] = [];
  searchTerm$ = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private contactService: ContactService,
    private auth: AuthService,
    private router: Router,
    public loaderService: LoaderService,
    private matSnack: MatSnackBar,
    private entityService: EntityService,
    private dialog: MatDialog,
    private rdService: RequiredDocumentsService
  ) {
    this.createMilestoneListForm();
    this.getAllLists();
    this.createPropertiesForm();
    this.creatEmailPropertiesForm();
    this.getProperties();
    this.createUsersForm();
    this.getUsers();
    this.getAllEntities();
    this.getAllReqDocs();
    this.contactService.searchContacts(this.searchTerm$)
      .subscribe(res => {
        if (res) {
          this.allContacts = res;
        }
      });
  }

  ngOnInit() {}
  iAmAdmin() {
    return this.auth.isTopLevelUser();
  }
  showRoute() {
    let route = this.router.url.replace('/', '').replace('-', ' ');
    route = route.toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');
    return route;
  }
  // ================== MILESTONE FUNCTIONS ==============================
  createMilestoneListForm() {
    this.MilestoneListForm = this.fb.group({
      list: this.fb.array([]),
    });
  }
  get list(): FormArray {
    return this.MilestoneListForm.get('list') as FormArray;
  }
  getMilestones(i): FormArray {
    return this.list.at(i).get('milestones') as FormArray;
  }
  addMilestoneList() {
    const msl = this.fb.group({
      _id: [''],
      title: ['', Validators.required],
      milestones: this.fb.array([]),
      updatedBy: ['new']
    });
    const arrayControl = <FormArray>this.list;
    arrayControl.push(msl);
    this.addMilestone(this.list.length - 1);
  }
  addMilestone(i) {
    const ms = this.fb.group({
      _id: [''],
      name: ['', Validators.required],
      number: new FormControl({value: this.getMilestones(i).length + 1}),
      emailMessage: ['', Validators.required],
      smsMessage: ['', Validators.required],
      sendEmail: [false],
      sendSMS: [false],
      alwaysAsk: [false],
      updatedBy: ['new']
    });
    const arrayControl = <FormArray>this.list.at(i).get('milestones');
    arrayControl.push(ms);
  }
  removeMilestoneList (e, i) { // remove result from form array
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to delete this list and all milestones associated with it?')) {
      const list = this.list.at(i);
      const control = <FormArray>this.list;
      if (list.value.updatedBy === 'new') {
        this.matSnack.open('List removed successfully');
        control.removeAt(i);
      } else {
        this.adminService.deleteList(list.value._id)
          .subscribe(res => {
            if (res) {
              this.matSnack.open('List removed successfully');
              control.removeAt(i);
            } else {
              const sb = this.matSnack.open('Delete unsuccessful', 'retry');
              sb.onAction().subscribe(() => {
                this.removeMilestoneList(e, i);
              });
            }
          }, err => {
            const sb = this.matSnack.open('Delete unsuccessful', 'retry');
            sb.onAction().subscribe(() => {
              this.removeMilestoneList(e, i);
            });
            console.log(err);
          });
      }
    }
  }
  removeMilestone (e, i, k) { // remove result from form array
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to delete this milestone?')) {
      const milestone = this.getMilestones(i).at(k);
      if (milestone.value.updatedBy !== 'new') {
        this.adminService.deleteMilestone(milestone.value._id, this.list.at(i).get('_id').value)
          .subscribe(res => {
            if (res) {
              const control = <FormArray>this.getMilestones(i);
              control.removeAt(k);
              this.matSnack.open('Milestone removed successfully');
            } else {
              const sb = this.matSnack.open('Delete unsuccessful', 'retry');
              sb.onAction().subscribe(() => {
                this.removeMilestone(e, i, k);
              });
            }
          }, err => {
            const sb = this.matSnack.open('Delete unsuccessful', 'retry');
            sb.onAction().subscribe(() => {
              this.removeMilestone(e, i, k);
            });
            console.log(err);
          });
      } else {
        const control = <FormArray>this.getMilestones(i);
        control.removeAt(k);
        this.matSnack.open('Milestone removed successfully');
      }
    }
  }
  insertNoti(e, i, k, msg, control, ctr) {
    e.preventDefault();
    const value = this.getMilestones(i).at(k).get(control).value;
    if (ctr.selectionStart || ctr.selectionStart === 0) {
      if (ctr.selectionEnd || ctr.selectionEnd === 0) {
        const msgStart = value.substring(0, ctr.selectionStart);
        const msgEnd = value.substring(ctr.selectionEnd, value.length);
        this.getMilestones(i).at(k).get(control).setValue(msgStart + msg + msgEnd);
      }
    }
    // this.getMilestones(i).at(k).get(control).setValue(this.getMilestones(i).at(k).get(control).value + msg);
  }
  getAllLists() {
    this.adminService.getAllMilestoneLists()
      .subscribe(res => {
        this.allLists = res;
        this.patchLists(res);
      });
  }
  patchLists(lists) {
    lists.forEach((list, i) => {
      const msl = this.fb.group({
        _id: [''],
        title: ['', Validators.required],
        milestones: this.fb.array([]),
        updatedBy: ['new']
      });
      const arrayControl = <FormArray>this.list;
      msl.patchValue(list);
      list.milestones.forEach((m, k) => {
        const ms = this.fb.group({
          _id: [''],
          name: ['', Validators.required],
          number: new FormControl({value: m.number ? m.number : k + 1}),
          emailMessage: ['', Validators.required],
          smsMessage: ['', Validators.required],
          sendEmail: [false],
          sendSMS: [false],
          alwaysAsk: [false],
          updatedBy: ['']
        });
        const mArrayControl = <FormArray>msl.get('milestones');
        ms.patchValue(m);
        mArrayControl.push(ms);
      });
      arrayControl.push(msl);
    });
  }
  onMilestoneChange(i, k): void {
    if (this.getMilestones(i).at(k).value.updatedBy !== 'new') {
      console.log('setting milestone as updated');
      this.getMilestones(i).at(k).get('updatedBy').setValue('updated');
    }
  }
  onListChange(i): void {
    if (this.list.at(i).value.updatedBy !== 'new') {
      console.log('setting list as updated');
      this.list.at(i).get('updatedBy').setValue('updated');
    }
  }
  submitMilestones(i) {
    const list = this.list.at(i).value;
    if (this.list.at(i).valid) {
      if (list.updatedBy === 'new') { // new list save to db
        list.updatedBy = this.auth.getID();
        list.milestones.forEach(m => {
          m.updatedBy = list.updatedBy;
        });
        this.adminService.createNewList(list)
          .subscribe(res => {
            if (res) {
              // Insert all milestones and append to list
              this.adminService.createMilestones(list.milestones, res._id)
                .subscribe(l => {
                  if (l) {
                    // if milestones added successfully return the list.
                    this.list.at(i).patchValue(l);
                    this.matSnack.open('Milestones saved successfully');
                  } else {
                    const sb = this.matSnack.open('Save unsuccessful', 'retry');
                    sb.onAction().subscribe(() => {
                      this.submitMilestones(i);
                    });
                  }
                }, err => {
                  const sb = this.matSnack.open('Save unsuccessful', 'retry');
                  sb.onAction().subscribe(() => {
                    this.submitMilestones(i);
                  });
                  console.log(err);
                });
            } else {
              const sb = this.matSnack.open('Save unsuccessful', 'retry');
              sb.onAction().subscribe(() => {
                this.submitMilestones(i);
              });
            }
          }, err => {
            const sb = this.matSnack.open('Save unsuccessful', 'retry');
            sb.onAction().subscribe(() => {
              this.submitMilestones(i);
            });
            console.log(err);
          });
      } else if (list.updatedBy === 'updated') {
        list.updatedBy = this.auth.getID();
        list.milestones.forEach((m, k) => {
          if (m.updatedBy === 'updated') { // existing milestone needs to be updated
            m.updatedBy = list.updatedBy;
            this.adminService.updateMilestone(m)
              .subscribe(res => {
                if (res) {
                  console.log('milestone update successful');

                } else {
                  alert('Oops, something went wrong');
                }
              }, err => {
                console.log(err);
              });
          } else if (m.updatedBy === 'new') { // new milestone needs to be pushed
            m.updatedBy = list.updatedBy;
            this.adminService.createMilestone(m, list._id)
              .subscribe(res => {
                if (res) {
                  console.log('milestone create successful: \n');
                } else {
                  alert('Oops, something went wrong');
                }
              }, err => {
                console.log(err);
              });
          }
        });
        this.adminService.updateList(list)
          .subscribe(res => {
            this.matSnack.open('List saved successfully');
            this.list.at(i).patchValue(list);
          }, err => {
            const sb = this.matSnack.open('Save unsuccessful', 'retry');
            sb.onAction().subscribe(() => {
              this.submitMilestones(i);
            });
            console.log(err);
          });
        this.list.at(i).patchValue(list);
      }
    }
  }
  // ================== MILESTONE FUNCTIONS ==============================
  // ================== FILE PROPERTIES FUNCTIONS ========================
  createPropertiesForm() {
    this.PropertiesForm = this.fb.group({
      propertyTypes: this.fb.array([]),
      actionTypes: this.fb.array([]),
      deedsOffices: this.fb.array([])
    });
  }
  get propertyTypes(): FormArray {
    return this.PropertiesForm.get('propertyTypes') as FormArray;
  }
  get actionTypes(): FormArray {
    return this.PropertiesForm.get('actionTypes') as FormArray;
  }
  get deedsOffices(): FormArray {
    return this.PropertiesForm.get('deedsOffices') as FormArray;
  }
  addPropertyType(existing?) {
    const pt = this.fb.group({
      name: ['', Validators.required],
      updatedBy: [existing ? 'existing' : 'new']
    });
    const arrayControl = <FormArray>this.propertyTypes;
    arrayControl.push(pt);
  }
  addActionType(existing?) {
    const at = this.fb.group({
      name: ['', Validators.required],
      updatedBy: [existing ? 'existing' : 'new']
    });
    const arrayControl = <FormArray>this.actionTypes;
    arrayControl.push(at);
  }
  addDeedsOffice(existing?) {
    const d = this.fb.group({
      name: ['', Validators.required],
      updatedBy: [existing ? 'existing' : 'new']
    });
    const arrayControl = <FormArray>this.deedsOffices;
    arrayControl.push(d);
  }
  removePropertyType(e, i) {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to delete this property type?')) {
      const pt = this.propertyTypes.at(i);
      const control = <FormArray>this.propertyTypes;
      control.removeAt(i);
      if (pt.value.updatedBy !== 'new') {
        this.submitProperties();
      }
    }
  }
  removeActionType(e, i) {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to delete this action type?')) {
      const at = this.actionTypes.at(i);
      const control = <FormArray>this.actionTypes;
      control.removeAt(i);
      if (at.value.updatedBy !== 'new') {
        this.submitProperties();
      }
    }
  }
  removeDeedsOffice(e, i) {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to delete this deeds office?')) {
      const d = this.deedsOffices.at(i);
      const control = <FormArray>this.deedsOffices;
      control.removeAt(i);
      if (d.value.updatedBy !== 'new') {
        this.submitProperties();
      }
    }
  }
  patchProperties(p) {
    if (p.propertyTypes) {
      p.propertyTypes.forEach((pt, i) => {
        if (!this.propertyTypes.at(i)) {
          this.addPropertyType(true);
          this.propertyTypes.at(i).patchValue({name: pt});
        } else {
          this.propertyTypes.at(i).patchValue({name: pt, updatedBy: 'existing'});
        }
      });
    }
    if (p.actionTypes) {
      p.actionTypes.forEach((at, i) => {
        if (!this.actionTypes.at(i)) {
          this.addActionType(true);
          this.actionTypes.at(i).patchValue({name: at});
        } else {
          this.actionTypes.at(i).patchValue({name: at, updatedBy: 'existing'});
        }
      });
    }
    if (p.deedsOffices) {
      p.deedsOffices.forEach((d, i) => {
        if (!this.deedsOffices.at(i)) {
          this.addDeedsOffice(true);
          this.deedsOffices.at(i).patchValue({name: d});
        } else {
          this.deedsOffices.at(i).patchValue({name: d, updatedBy: 'existing'});
        }
      });
    }
    if (p.commentMailFooter) {
      this.commentMailFooter.patchValue(p.commentMailFooter);
    }
  }
  getProperties() {
    this.adminService.getProperties()
      .subscribe((p) => {
        if (p) {
          this.patchProperties(p);
        }
      }, err => {
        console.log(err);
      });
  }
  onPropTypeChange(i) {
    const prop = this.propertyTypes.at(i);
    if (prop.value.updatedBy === 'existing') {
      console.log('setting property type as updated');
      prop.get('updatedBy').setValue('updated');
    }
  }
  onActionTypeChange(i) {
    const action = this.actionTypes.at(i);
    if (action.value.updatedBy === 'existing') {
      console.log('setting action type as updated');
      action.get('updatedBy').setValue('updated');
    }
  }
  onDeedsOffChange(i) {
    const d = this.deedsOffices.at(i);
    if (d.value.updatedBy === 'existing') {
      console.log('setting deeds office as updated');
      d.get('updatedBy').setValue('updated');
    }
  }
  submitProperties() {
    this.adminService.userHasProperties()
      .subscribe((p) => {
        const hasProperties = p;
        const propertyTypes = [];
        const actionTypes = [];
        const deedsOffices = [];
        const body = { // build payload by reducing form values to arrays of names
          propertyTypes: this.propertyTypes.value.map((pt) => pt.name),
          actionTypes: this.actionTypes.value.map((at) => at.name),
          deedsOffices: this.deedsOffices.value.map((d) => d.name)
        };
        if (!hasProperties) { // if user doensn't already have properties assigned create new properties
          this.adminService.createProperties(body)
            .subscribe((res) => {
              if (res) {
                this.matSnack.open('Properties saved successfully');
                this.patchProperties(res);
              } else {
                const sb = this.matSnack.open('Save unsuccessful', 'retry');
                sb.onAction().subscribe(() => {
                  this.submitProperties();
                });
              }
            }, err => {
              const sb = this.matSnack.open('Save unsuccessful', 'retry');
              sb.onAction().subscribe(() => {
                this.submitProperties();
              });
              console.log(err);
            });
        } else { // else update existing properties
          this.adminService.updateProperties(body)
            .subscribe(res => {
              if (res) {
                this.matSnack.open('Properties saved successfully');
              } else {
                const sb = this.matSnack.open('Save unsuccessful', 'retry');
                sb.onAction().subscribe(() => {
                  this.submitProperties();
                });
              }
            }, err => {
              const sb = this.matSnack.open('Save unsuccessful', 'retry');
              sb.onAction().subscribe(() => {
                this.submitProperties();
              });
              console.log(err);
            });
        }
      }, err => {
        console.log(err);
      });
  }
  creatEmailPropertiesForm() {
    this.EmailPropsForm = this.fb.group({
      commentMailFooter: ['']
    });
  }
  submitEmailProperties() {
    if (this.EmailPropsForm.valid) {
      this.adminService.updateProperties(this.EmailPropsForm.value)
        .subscribe(res => {
          if (res) {
            this.matSnack.open('Saved successfully');
          } else {
            const sb = this.matSnack.open('Could not save properties', 'retry');
            sb.onAction().subscribe(() => {
              this.submitEmailProperties();
            });
          }
        }, (err) => {
          console.log(err);
        });
    }
  }
  get commentMailFooter() {
    return this.EmailPropsForm.get('commentMailFooter');
  }
  insertFooterPh(e, msg, ctr) {
    e.preventDefault();
    const value = this.commentMailFooter.value;
    if (ctr.selectionStart || ctr.selectionStart === 0) {
      if (ctr.selectionEnd || ctr.selectionEnd === 0) {
        const msgStart = value.substring(0, ctr.selectionStart);
        const msgEnd = value.substring(ctr.selectionEnd, value.length);
        this.commentMailFooter.setValue(msgStart + msg + msgEnd);
      }
    }
  }
  // ================== FILE PROPERTIES FUNCTIONS ========================
  // ================== CONTACTS FUNCTIONS ===============================
  createNewContactDialog(ct?) {
    let index = -1;
    const dialConfig = new MatDialogConfig();
    dialConfig.disableClose = true;
    dialConfig.autoFocus = true;
    if (ct) {
      dialConfig.data = ct;
      dialConfig.data.existing = true;
      index = this.allContacts.indexOf(ct);
    } else {
      dialConfig.data = {
        new: true
      };
    }
    const dialogRef = this.dialog.open(AddContactDialogComponent, dialConfig);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        if (index > -1) {
          this.allContacts[index] = res;
        } else {
          this.allContacts.push(res);
        }
      }
    });
  }
  addContact() {
    this.createNewContactDialog();
  }
  removeContact(ct, i) {
    const index = this.allContacts.indexOf(ct);
    if (confirm('Are you sure you want to delete ' + ct.name  + ' from your contact list?')) {
      this.contactService.deleteContact(ct._id)
        .subscribe(res => {
          if (res) {
            this.matSnack.open('Contact removed successfully');
            this.allContacts.splice(index, 1);
          } else {
            const sb = this.matSnack.open('Contact not removed successful', 'retry');
            sb.onAction().subscribe(() => {
              this.removeContact(ct, i);
            });
          }
        }, err => {
          const sb = this.matSnack.open('Contact not removed successful', 'retry');
          sb.onAction().subscribe(() => {
            this.removeContact(ct, i);
          });
          console.log(err);
        });
    }
  }
  // ================== CONTACTS FUNCTIONS ===============================
  // ================== USER FUNCTIONS ===================================
  createUsersForm() {
    this.UsersForm = this.fb.group({
      users: this.fb.array([]),
      updated: ['new']
    });
  }
  get users(): FormArray {
    return this.UsersForm.get('users') as FormArray;
  }
  addUser(existing?) {
    const u = this.fb.group({
      _id: [''],
      surname: ['', Validators.required],
      name: ['', Validators.required],
      cell: ['', [Validators.required, GlobalValidators.cellRegex]],
      email: ['', [Validators.required, Validators.email],
        existing ? null : this.shouldBeUniqueUser.bind(this)],
      updatedBy: [existing ? 'existing' : 'new'],
      role: ['admin', Validators.required],
      companyAdmin: [this.auth.isTopLevelUser() ? this.auth.getID() : this.auth.getAdminID()],
      passwordHash: ['admin']
    });
    const arrayControl = <FormArray>this.users;
    if (existing) { u.get('email').disable(); }
    arrayControl.push(u);
  }
  shouldBeUniqueUser(control: AbstractControl): Promise<ValidationErrors> | null {
    const q = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (control.value === '') {
          resolve(null);
        } else {
          this.auth.getUserByEmail(control.value).subscribe((res) => {
            if (!res) {
              resolve(null);
            } else {
              resolve({'emailNotUnique': true});
            }
          });
        }
      }, 100);
    });
    return q;
  }
  removeUser(e, i) {
    e.stopPropagation();
    e.preventDefault();
    const u = this.users.at(i);
    if (confirm('Are you sure you want to delete ' +
      (u.get('name').value ? u.get('name').value : 'this contact') + ' from your user list?')) {
      const control = <FormArray>this.users;
      if (u.value.updatedBy === 'new') {
        control.removeAt(i);
        this.matSnack.open('User removed successfully');
      } else {
        this.auth.deleteUser(u.value._id)
          .subscribe(res => {
            if (res) {
              this.matSnack.open('User removed successfully');
              control.removeAt(i);
            } else {
              const sb = this.matSnack.open('User not removed successful', 'retry');
              sb.onAction().subscribe(() => {
                this.removeUser(e, i);
              });
            }
          }, err => {
            const sb = this.matSnack.open('User not removed successful', 'retry');
            sb.onAction().subscribe(() => {
              this.removeUser(e, i);
            });
            console.log(err);
          });
      }
    }
  }
  onUserChange(i) {
    const u = this.users.at(i);
    if (u.value.updatedBy === 'existing') {
      console.log('setting contact as updated');
      u.get('updatedBy').setValue('updated');
    }
  }
  patchUsers(us) { // TODO: test patchUsers properly with multiple updates and adds
    us.forEach((u, i) => {
      if (!this.users.at(i)) {
          this.addUser(true);
          this.users.at(i).patchValue(u);
      } else {
        this.users.at(i).patchValue(u);
      }
    });
  }
  getUsers() {
    this.auth.getUsers()
      .subscribe(res => {
        if (res) {
          this.patchUsers(res);
        }
      }, err => {
        console.log(err);
      });
  }
  submitUser(i) {
    const u = this.users.at(i);
    if (u.value.updatedBy === 'new') {
      const newUser = u.value;
      delete newUser.updatedBy;
      delete newUser._id;
      this.auth.addUser(newUser)
        .subscribe(res => {
          if (res) {
            this.matSnack.open('User created successfully');
            u.patchValue(res);
            u.get('email').clearAsyncValidators();
            u.get('email').disable();
            u.get('updatedBy').setValue('existing');
          } else {
            const sb = this.matSnack.open('User not created successfully', 'retry');
            sb.onAction().subscribe(() => {
              this.submitUser(i);
            });
          }
        }, err => {
          const sb = this.matSnack.open('User not created successfully', 'retry');
          sb.onAction().subscribe(() => {
            this.submitUser(i);
          });
          console.log(err);
        });
    } else if (u.value.updatedBy === 'updated') {
      const newUser = u.value;
      delete newUser.updatedBy;
      console.log('before update: \n' + newUser);
      this.auth.updateUser(newUser)
        .subscribe(res => {
          if (res) {
            this.users.at(i).patchValue(res);
            this.users.at(i).get('updatedBy').setValue('existing');
            this.matSnack.open('Update successful');
          } else {
            const sb = this.matSnack.open('Update unsuccessful', 'retry');
            sb.onAction().subscribe(() => {
              this.submitUser(i);
            });
          }
        }, err => {
          const sb = this.matSnack.open('Update unsuccessful', 'retry');
          sb.onAction().subscribe(() => {
            this.submitUser(i);
          });
          console.log(err);
        });
    }
    // console.log(this.contacts.at(i).value);
  }
  // ================== USER FUNCTIONS ===================================
  // ================== ENTITY FUNCTIONS =================================
  getAllEntities() {
    this.entityService.getAllEntities()
      .subscribe(res => {
        this.allEntities = res;
      });
  }
  addEntity() {
    const dialConfig = new MatDialogConfig();
    dialConfig.disableClose = true;
    dialConfig.autoFocus = true;
    dialConfig.data = {
      allContact: this.allContacts
    };
    const dialogRef = this.dialog.open(AddEntityDialogComponent, dialConfig);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.allEntities.push(res);
      }
    });
  }
  editEntity(e) {
    const dialConfig = new MatDialogConfig();
    dialConfig.disableClose = true;
    dialConfig.autoFocus = true;
    const body = {...e}; // deep copy
    body.contacts = body.contacts.map(c => {
      return {
        _id: c._id,
        name: c.name + ' ' + c.surname
      };
    });
    body.files = body.files.map(f => {
      return {
        _id: f._id,
        fileRef: f.fileRef
      };
    });
    dialConfig.data = {
      allContact: this.allContacts,
      entity: body
    };
    const dialogRef = this.dialog.open(AddEntityDialogComponent, dialConfig);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        console.log(res);
        const index = this.allEntities.indexOf(e);
        this.allEntities[index] = res;
      }
    });
  }
  removeEntity(e) {
    if (confirm('Are you sure you want to delete ' + e.name + ' from your entities list?')) {
      this.entityService.deleteEntity(e._id)
        .subscribe(res => {
          if (res) {
            this.matSnack.open('Entity deleted successfully');
            this.allEntities = this.allEntities.filter(entity => {
              return entity._id !== e._id;
            });
          } else {
            const sb = this.matSnack.open('Entity not deleted successfully', 'retry');
            sb.onAction().subscribe(() => {
              this.removeEntity(e);
            });
          }
        }, err => {
          const sb = this.matSnack.open('Entity not deleted successfully', 'retry');
          sb.onAction().subscribe(() => {
            this.removeEntity(e);
          });
        });
    }
  }
  // ================== ENTITY FUNCTIONS =================================
  // ================== REQ DOCUMENTS FUNCTIONS ==========================
  addReqDoc() {
    const dialConfig = new MatDialogConfig();
    dialConfig.disableClose = true;
    dialConfig.autoFocus = true;
    dialConfig.data = {
      milestoneLists: this.allLists
    };
    const dialogRef = this.dialog.open(AddRequiredDocumentDialogComponent, dialConfig);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.allRDs.push(res);
      }
    });
  }
  getAllReqDocs() {
    this.rdService.getAllReqDocs()
      .subscribe(res => {
        if (res) {
          this.allRDs = res;
        }
      }, err => {
        console.log(err);
    });
  }
  editRD(rd) {
    const dialConfig = new MatDialogConfig();
    dialConfig.disableClose = true;
    dialConfig.autoFocus = true;
    dialConfig.data = {
      milestoneList: this.allLists,
      rd: rd
    };
    const dialogRef = this.dialog.open(AddRequiredDocumentDialogComponent, dialConfig);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        const index = this.allRDs.indexOf(rd);
        this.allRDs[index] = res;
      }
    });
  }
  removeRD(rd) {
    if (confirm('Are you sure you want to delete ' + rd.name + ' from your required documents list?')) {
      this.rdService.deleteRequiredDocument(rd._id)
        .subscribe(res => {
          if (res) {
            this.matSnack.open('Required Document deleted successfully');
            this.allRDs = this.allRDs.filter(RD => {
              return RD._id !== rd._id;
            });
          } else {
            const sb = this.matSnack.open('Required Document not deleted successfully', 'retry');
            sb.onAction().subscribe(() => {
              this.removeRD(rd);
            });
          }
        }, err => {
          const sb = this.matSnack.open('Required Document not deleted successfully', 'retry');
          sb.onAction().subscribe(() => {
            this.removeRD(rd);
          });
        });
    }
  }

  // TODO: Take out forms and make static content. Use dialog forms for adding and updating
  // TODO: BUG when adding user form before proper load -> doesn't set updated properly
}
