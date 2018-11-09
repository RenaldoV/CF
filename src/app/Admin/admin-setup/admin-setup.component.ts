import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AdminService} from '../admin.service';

@Component({
  selector: 'app-admin-setup',
  templateUrl: './admin-setup.component.html',
  styleUrls: ['./admin-setup.component.css']
})
export class AdminSetupComponent implements OnInit {
  MilestoneListForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService
  ) {
    this.createMilestoneListForm();
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
      const control = <FormArray>this.list.at(i).get('milestones');
      control.removeAt(k);
    }
  }
  showPlaceholderText(): string {
    return '*contact_name* = Contact\'s Name \n*erf_name* = Erf Name \n*deeds_office* = ' +
      'Deeds Office \n*my_name* = My Name" style="cursor: pointer';
  }
  submitMilestones(i) {
    if (this.list.at(i).valid) {
      const list = this.list.at(i).value;
      this.adminService.createList(list);
    }
  }
  // ================== MILESTONE FUNCTIONS ==============================
}
