import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../auth/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FileService} from '../file.service';
import {LoaderService} from '../../Common/Loader';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css']
})
export class FileComponent implements OnInit {
  fileID;
  userID;
  file;
  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fileService: FileService,
    public loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.fileID = this.route.snapshot.paramMap.get('id');
    this.userID = this.auth.getID();

    this.fileService.getFile(this.fileID)
      .subscribe(res => {
        if (res) {
          this.file = res;
        }
      });
  }

  convertDate(inputFormat, d) {
    d = new Date(d);
    function pad(s) { return (s < 10) ? '0' + s : s; }
    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
  }

  getCompanyInfo() {
    if ( this.file.createdBy.companyAdmin ) {
      return {
        company: this.file.companyAdmin.company,
        name: this.file.createdBy.companyAdmin.name + '' + this.file.createdBy.companyAdmin.surname,
        email: this.file.createdBy.companyAdmin.email
      };
    } else {
      return {
        company: this.file.createdBy.company,
        name: this.file.createdBy.name + '' + this.file.createdBy.surname,
        email: this.file.createdBy.email
      };
    }
  }

  containsAgent() {
    return this.file.contacts.map(ct => ct.type).includes('Agent');
  }
  getContacts() {
    if (this.iAmAgent() < 1) {
      return this.file.contacts.filter(ct => ct.type === 'Agent');
    } else {
      return this.file.contacts.filter(ct => ct._id !== this.auth.getID());
    }
  }
  iAmAgent() {
    const agents = this.file.contacts.filter(ct => ct.type === 'Agent');
    if (agents.map(a => a._id).includes(this.auth.getID())) {
      return 1;
    } else {
      return 0;
    }
  }
  numCards() {
    if (this.iAmAgent()) {
      return this.file.contacts.length + 1 + this.file.refUser.length <= 4 ? '' : '-3';
    } else {
      return this.file.contacts.length + 1 + this.file.refUser.length - this.file.contacts.filter(ct => ct.type === 'Agent').length <= 4 ? '' : '-3';
    }
  }

}
