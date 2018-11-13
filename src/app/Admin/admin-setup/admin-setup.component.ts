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
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private auth: AuthService,
    public loaderService: LoaderService
  ) {
    this.createMilestoneListForm();
    this.getAllLists();
  }

  ngOnInit() {

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
    if (confirm('Are you sure you want to delete this milestone list?')) {
      const control = <FormArray>this.list;
      control.removeAt(i);
    }
  }
  removeMilestone (e, i, k) { // remove result from form array
    e.preventDefault();
    if (confirm('Are you sure you want to delete this milestone?')) {
      const milestone = this.getMilestones(i).at(k);
      if (milestone.value.updatedBy !== 'new') {
        console.log('deleting existing doc ');
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
        console.log('deleting non existing doc');
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
        console.log(this.MilestoneListForm.value);
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
      this.getMilestones(i).at(i).get('updatedBy').setValue('updated');
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
      } else if (list.updatedBy === 'updated') { // TODO: update list
        list.updatedBy = this.auth.getID();
        list.milestones.forEach((m, k) => {
          if (m.updatedBy === 'updated') { // existing milestone needs to be updated
            m.updatedBy = list.updatedBy;
            this.adminService.updateMilestone(m)
              .subscribe(res => {
                if (res) {
                  console.log('update successful');
                  this.getMilestones(i).at(k).patchValue(m);
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
                  console.log('create successful'); // TODO: patch value of new Milestone
                } else {
                  alert('Oops, something went wrong');
                }
              }, err => {
                console.log(err);
              });
          }
        });
        this.list.at(i).patchValue(list);
        console.log(this.list.at(i).value);
      }
    }
  }
  // ================== MILESTONE FUNCTIONS ==============================
}
