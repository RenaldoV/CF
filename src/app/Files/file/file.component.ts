import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../auth/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FileService} from '../file.service';
import {LoaderService} from '../../Common/Loader';
import {UploadService} from '../../Uploads/upload.service';
import {DomSanitizer} from '@angular/platform-browser';
import * as FileSave from 'file-saver';
import * as FileSaver from 'file-saver';
import {RequiredDocumentsService} from '../../RequiredDocuments/required-documents.service';


@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css']
})
export class FileComponent implements OnInit {
  fileID;
  userID;
  file;
  milestoneOpenState;
  uploads;
  requiredDocs;
  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fileService: FileService,
    public loaderService: LoaderService,
    public uploadService: UploadService,
    public reqDocService: RequiredDocumentsService
  ) { }

  ngOnInit() {
    this.fileID = this.route.snapshot.paramMap.get('id');
    this.userID = this.auth.getID();

    this.fileService.getFile(this.fileID)
      .subscribe(res => {
        if (res) {
          this.file = res;
          this.reqDocService.getAllReqDocs()
            .subscribe(rds => {
              if (rds) {
                const milestoneIds = this.file.milestoneList.milestones.map(m => m._id._id);
                this.requiredDocs = rds.filter(rd => { // get all required docs that are part of milestones that are completed
                  return milestoneIds.indexOf(rd.milestone._id) > -1;
                });
              }
            }, er => {
              console.log(er);
            });
        }
      }, (er) => {
        if (er) {
          alert('file not found, please use the link provided in the email.');
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
  formatDate(date) {
    const d = new Date(date);
    return [d.getDate(), d.getMonth() + 1, d.getFullYear()]
      .map(n => n < 10 ? `0${n}` : `${n}`).join('/');
  }
  tabChanged(e) { // get my uploads
    if (e.tab.textLabel === 'Document Uploads' && !this.uploads) {
      this.uploadService.getContactUploads(this.userID)
        .subscribe(res => {
          if (res) {
            res = res.map(u => {
              if (u.mimeType.substring(0, u.mimeType.indexOf('/')) === 'image') {
                u.path = 'data:' + u.mimeType + ';base64,' + u.path;
                return u;
              } else {
                return u;
              }
            });
            if (this.requiredDocs) {
              const newReqDocs = JSON.parse(JSON.stringify(this.requiredDocs));
              newReqDocs.forEach(rd => {
                rd.uploads = [];
                rd.uploads = res.filter(u => u.requiredDocumentID._id === rd._id);
              });
              this.requiredDocs = newReqDocs;
            }
            this.uploads = res;
          }
        }, err => {
          if (err) {
            console.log(err);
          }
        });
    }
  }
  docType(type) {
    if (type.substring(type.lastIndexOf('/') + 1, type.length) === 'pdf') {
      return 'pdf';
    } else {
      return 'word';
    }
  }
  downloadDoc(d) {
    this.uploadService.download(d.name)
      .subscribe(res => FileSaver.saveAs(res, d.name), er => console.log(er));
  }
  gotoUpload(reqDocID) {
    this.router.navigate(['/upload', this.fileID, reqDocID, this.userID]);
  }
}
