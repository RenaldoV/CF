import {Component, Inject, OnInit} from '@angular/core';
import {ContactService} from '../../Contact/contact.service';
import {RequiredDocumentsService} from '../../RequiredDocuments/required-documents.service';
import {FileService} from '../../Files/file.service';
import {ActivatedRoute, Router} from '@angular/router';
import {LoaderService} from '../../Common/Loader';
import {FileItem, FileLikeObject, FileUploader} from 'ng2-file-upload';
import {WINDOW} from '../../window.service';
import {MatSnackBar} from '@angular/material';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  file;
  contact;
  requiredDoc;
  url;
  public uploader: FileUploader;
  public hasBaseDropZoneOver: boolean = false;
  allowedFileTypes = [
    'image/jpeg',
    'image/gif',
    'image/png',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.oasis.opendocument.text'
  ];
  constructor(
    private contacService: ContactService,
    private rdService: RequiredDocumentsService,
    private fileService: FileService,
    private route: ActivatedRoute,
    private router: Router,
    public loaderService: LoaderService,
    public matSnack: MatSnackBar,
    public authService: AuthService,
    @Inject(WINDOW) private window: Window
  ) {
    this.url = `${window.location.protocol}//${window.location.host}` + '/user/upload';
     // route snapshot in order upload/fileID/reqDocID/contactID
    const fileID = route.snapshot.paramMap.get('file');
    const contactID = route.snapshot.paramMap.get('contact');
    const reqDocID = route.snapshot.paramMap.get('requiredDoc');
    this.uploader = new FileUploader({
      url: this.url,
      additionalParameter: {contactID: contactID, requiredDocumentID: reqDocID, fileID: fileID},
      allowedMimeType: this.allowedFileTypes,
      maxFileSize: 10 * 1024 * 1024
    });
    this.uploader.onAfterAddingFile = (file: FileItem) => {
      file.file.name = this.requiredDoc.name.replace(/[^a-z0-9_\-]/gi, '_') + (this.uploader.getIndexOfItem(file) + 1) +
        '_' + contactID + file.file.name.substring(file.file.name.lastIndexOf('.'), file.file.name.length);
    };
    this.uploader.onWhenAddingFileFailed = (item: FileLikeObject, filter: any, options: any) => {
      if (this.allowedFileTypes.indexOf(item.type) === - 1) {
        this.matSnack.open('This file type is not supported');
      } else if (item.size > (10 * 1024 * 1024)) {
        this.matSnack.open('This file exceeds the size limit of 10 MB');
      }
    };
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

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }
  gotoLogin() {
    if (this.authService.getUser()) {
      this.router.navigate(['file', this.file._id]);
    } else {
      this.router.navigate(['login', this.file._id, this.contact._id]);
    }

  }

}
