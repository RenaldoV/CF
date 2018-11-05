import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {
  filterForm: FormGroup;
  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
  }
  createForm() {
    this.filterForm = this.fb.group({
      fileRef: [''],
      ourRef: [''],
      buyerSeller: [''],
      agent: ['']
    });
  }
  get fileRef() {
    return this.filterForm.get('fileRef');
  }
  get ourRef() {
    return this.filterForm.get('ourRef');
  }
  get buyerSeller() {
    return this.filterForm.get('buyerSeller');
  }
  get agent() {
    return this.filterForm.get('agent');
  }

}
