import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-admin-setup',
  templateUrl: './admin-setup.component.html',
  styleUrls: ['./admin-setup.component.css']
})
export class AdminSetupComponent implements OnInit {
  MilestoneListForm: FormGroup;
  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
  }
  // ================== MILESTONE FUNCTIONS ==============================
  createMilestoneListForm() {
    this.MilestoneListForm = this.fb.group({
      title: ['', Validators.required],
      milestoneList: this.fb.array([])
    });
  }
  createMilestone(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      number: ['', Validators.required],
      notificationMessage: ['', Validators.required],
      sendEmail: [''],
      sendSMS: ['']
    });
  }
  get title() {
    return this.MilestoneListForm.get('title');
  }
  get milestoneList(): FormArray {
    return this.MilestoneListForm.get('milestoneList') as FormArray;
  }
  addMilestone() {
    const arrayControl = <FormArray>this.milestoneList;
    arrayControl.push(this.createMilestone());
  }
  removeMilestone (e, i) { // remove result from form array
    e.preventDefault();
    const control = <FormArray>this.milestoneList;
    control.removeAt(i);
  }
  // ================== MILESTONE FUNCTIONS ==============================
}
