import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AdminService} from '../admin.service';
import {LoaderService} from '../../Loader';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-admin-setup',
  templateUrl: './admin-setup.component.html',
  styleUrls: ['./admin-setup.component.css']
})
export class AdminSetupComponent implements OnInit {
  MilestoneListForm: FormGroup;
  PropertiesForm: FormGroup;
  ContactsForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private auth: AuthService,
    public loaderService: LoaderService
  ) {
    this.createMilestoneListForm();
    this.getAllLists();
    this.createPropertiesForm();
    this.getProperties();
    this.createContactsForm();
  }

  ngOnInit() {}
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
      number: new FormControl({value: this.getMilestones(i).length + 1, disabled: true}),
      notificationMessage: ['', Validators.required],
      sendEmail: [false],
      sendSMS: [false],
      updatedBy: ['new']
    });
    const arrayControl = <FormArray>this.list.at(i).get('milestones');
    arrayControl.push(ms);
  }
  removeMilestoneList (e, i) { // remove result from form array
    e.preventDefault();
    if (confirm('Are you sure you want to delete this list and all milestones associated with it?')) {
      const list = this.list.at(i);
      if (list.value.updatedBy !== 'new') {
        console.log('deleting existing list ');
        this.adminService.deleteList(list.value._id)
          .subscribe(res => {
            if (res) {
              const control = <FormArray>this.list;
              control.removeAt(i);
            } else {
              alert('Oops! Something went wrong.');
            }
          }, err => {
            console.log(err);
          });
      } else {
        console.log('deleting non existing list');
        const control = <FormArray>this.list;
        control.removeAt(i);
      }
    }
  } // TODO: Deleting list doesn't remove from user DB
  removeMilestone (e, i, k) { // remove result from form array
    e.preventDefault();
    if (confirm('Are you sure you want to delete this milestone?')) {
      const milestone = this.getMilestones(i).at(k);
      if (milestone.value.updatedBy !== 'new') {
        console.log('deleting existing milestone ');
        this.adminService.deleteMilestone(milestone.value._id, this.list.at(i).get('_id').value)
          .subscribe(res => {
            if (res) {
              const control = <FormArray>this.getMilestones(i);
              control.removeAt(k);
            } else {
              alert('Oops! Something went wrong.');
            }
          }, err => {
            console.log(err);
          });
      } else {
        console.log('deleting non existing milestone');
        const control = <FormArray>this.getMilestones(i);
        control.removeAt(k);
      }
    }
  }
  insertNoti(e, i, k, msg) {
    e.preventDefault();
    this.getMilestones(i).at(k).get('notificationMessage').setValue(this.getMilestones(i).at(k).value.notificationMessage + msg);
  }
  getAllLists() {
    this.adminService.getAllMilestoneLists()
      .subscribe(res => {
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
          number: new FormControl({value: k + 1, disabled: true}),
          notificationMessage: ['', Validators.required],
          sendEmail: [false],
          sendSMS: [false],
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
                    console.log(l);
                    console.log('insert Success');
                  } else {
                    return res;
                  }
                }, err => {
                  console.log(err);
                });
            } else {
              return res;
            }
          }, err => {
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
            console.log(res);
            this.list.at(i).patchValue(list);
          }, err => {
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
    e.preventDefault();
    if (confirm('Are you sure you want to delete this property type?')) {
      const pt = this.propertyTypes.at(i);
      const control = <FormArray>this.propertyTypes;
      control.removeAt(i);
      if (pt.value.updatedBy !== 'new') {
        console.log('deleting existing property type');
        this.submitProperties();
      } else {
        console.log('deleting non existing property type');
      }
    }
  }
  removeActionType(e, i) {
    e.preventDefault();
    if (confirm('Are you sure you want to delete this action type?')) {
      const at = this.actionTypes.at(i);
      const control = <FormArray>this.actionTypes;
      control.removeAt(i);
      if (at.value.updatedBy !== 'new') {
        console.log('deleting existing action type');
        this.submitProperties();
      } else {
        console.log('deleting non existing action type');
      }
    }
  }
  removeDeedsOffice(e, i) {
    e.preventDefault();
    if (confirm('Are you sure you want to delete this deeds office?')) {
      const d = this.deedsOffices.at(i);
      const control = <FormArray>this.deedsOffices;
      control.removeAt(i);
      if (d.value.updatedBy !== 'new') {
        console.log('deleting existing deeds office');
        this.submitProperties();
      } else {
        console.log('deleting non existing deeds office');
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
  userHasProperties() {

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
        console.log('has properties: ' + hasProperties);
        const propertyTypes = [];
        const actionTypes = [];
        const deedsOffices = [];
        const body = { // build payload by reducing form values to arrays of names
          propertyTypes: this.propertyTypes.value.map((pt) => pt.name),
          actionTypes: this.actionTypes.value.map((at) => at.name),
          deedsOffices: this.deedsOffices.value.map((d) => d.name)
        };
        if (!hasProperties) { // if user doensn't already have properties assigned create new properties
          this.adminService.createProperties(body, this.auth.getID())
            .subscribe((res) => {
              this.patchProperties(res);
              // console.log(this.PropertiesForm.value);
            }, err => {
              console.log(err);
            });
        } else { // else update existing properties
          console.log('updating properties');
          // console.log(body);
          this.adminService.updateProperties(body)
            .subscribe(res => {
              if (res) {
                this.patchProperties(res);
                // console.log(this.PropertiesForm.value);
              }
            }, err => {
              console.log(err);
            });
        }
      }, err => {
        console.log(err);
      });
  }
  // ================== FILE PROPERTIES FUNCTIONS ========================
  // ================== CONTACTS FUNCTIONS ===============================
  createContactsForm() {
    this.ContactsForm = this.fb.group({
      contacts: this.fb.array([])
    });
  }
  get contacts(): FormArray {
    return this.ContactsForm.get('contacts') as FormArray;
  }
  addContact(existing?) {
    const ct = this.fb.group({
      name: ['', Validators.required],
      cell: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      updatedBy: [existing ? 'existing' : 'new'],
      type: ['', Validators.required]
    });
    const arrayControl = <FormArray>this.contacts;
    arrayControl.push(ct);
  }
  submitContact(i) {
    console.log(this.contacts.at(i).value);
  }

  // ================== CONTACTS FUNCTIONS ===============================
}