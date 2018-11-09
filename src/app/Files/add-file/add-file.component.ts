import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-add-file',
  templateUrl: './add-file.component.html',
  styleUrls: ['./add-file.component.css']
})
export class AddFileComponent implements OnInit {
  fileForm: FormGroup;
  propForm: FormGroup;
  contactsForm: FormGroup;
  propTypes: any[] = ['wa', 'bla'];
  filteredProps: Observable<any[]>;
  actionTypes: any[] = ['wa', 'bla'];
  filteredActions: Observable<any[]>;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    this.createFileForm();
    this.createPropertyForm();
    // ======= Autocomplete Filters =============
    this.filteredProps = this.propType.valueChanges
      .pipe(
        startWith(''),
        map(prop => prop ? this.filterProps(prop) : this.propTypes.slice())
      );
    this.filteredActions = this.action.valueChanges
      .pipe(
        startWith(''),
        map(prop => prop ? this.filterProps(prop) : this.propTypes.slice())
      );
    // ======= Autocomplete Filters =============
  }
  ngOnInit() {}
  // ======= File Form functions ===============

    // ====auto complete functions=======
  filterProps(val: string) {
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
      this.propTypes.push(newState);
      // TODO: persist prop type to database
      this.propType.setValue(newState);
    }
  }
    // ====auto complete functions=======

  createFileForm() {
    this.fileForm = this.fb.group({
      fileRef: ['', Validators.required],
      action: ['', Validators.required],
      ourRef: [this.auth.getName(), Validators.required],
      milestoneProc: ['', Validators.required] // TODO: get milestone lists from DB
    });
  }
  get fileRef () {
    return this.fileForm.get('fileRef');
  }
  get action () {
    return this.fileForm.get('action');
  }
  get ourRef () {
    return this.fileForm.get('ourRef');
  }
  get milestoneProc () {
    return this.fileForm.get('milestoneProc');
  }
  // ======= File Form functions ===============
  // ======= Property Form functions ===============
  createPropertyForm() {
    this.propForm = this.fb.group({
      propType: ['', Validators.required],
      deedsOffice: ['', Validators.required],
      erfNum: ['', Validators.required],
      portionNum: ['', Validators.required]
    });
  }
  get deedsOffice () {
    return this.propForm.get('deedsOffice');
  }
  get erfNum () {
    return this.propForm.get('erfNum');
  }
  get portionNum () {
    return this.propForm.get('portionNum');
  }
  get propType () {
    return this.propForm.get('propType');
  }
  // ======= Property Form functions ===============

}
