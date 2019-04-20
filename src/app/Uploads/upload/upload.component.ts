import { Component, OnInit } from '@angular/core';
import {ContactService} from '../../Contact/contact.service';
import {RequiredDocumentsService} from '../../RequiredDocuments/required-documents.service';
import {FileService} from '../../Files/file.service';
import {ActivatedRoute, Router} from '@angular/router';
import {LoaderService} from '../../Common/Loader';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  file;
  contact;
  requiredDoc;
  constructor(
    private contacService: ContactService,
    private rdService: RequiredDocumentsService,
    private fileService: FileService,
    private route: ActivatedRoute,
    private router: Router,
    public loaderService: LoaderService
  ) {
     // route snapshot in order upload/fileID/reqDocID/contactID
    const fileID = route.snapshot.paramMap.get('file');
    const contactID = route.snapshot.paramMap.get('contact');
    const reqDocID = route.snapshot.paramMap.get('requiredDoc');
    this.contacService.getContact(contactID)
      .subscribe(res => {
        if (!res) {
          alert('This account does not exist. Please contact admin to resolve this issue.');
        } else {
          this.contact = res;
        }
      }, err => {
        if (err) {
          alert('This account does not exist. Please contact admin to resolve this issue.');
        }
      });
    this.fileService.getFile(fileID)
      .subscribe(res => {
        if (!res) {
          alert('This file does not exist, please contact admin to resolve this issue.');
        } else if (res.archived) {
          alert('You cannot upload documents to an archived file.');
        } else {
          this.file = res;
        }
      }, err => {
        if (err) {
          alert('This file does not exist, please contact admin to resolve this issue.');
        }
      });
    this.rdService.getRequiredDoc(reqDocID)
      .subscribe(res => {
        if (!res) {
          alert('This required document ID is incorrect, please contact admin to resolve this issue.');
        } else {
          this.requiredDoc = res;
        }
      }, err => {
        if (err) {
          alert('This required document id is incorrect, please contact admin to resolve this issue.');
        }
      });
  }

  ngOnInit() {
  }

}
