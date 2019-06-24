import {ViewChild, Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import {MatTableDataSource, MatSort, MatPaginator, MatSnackBar, MatDialogConfig, MatDialog} from '@angular/material';
import {FileService} from '../file.service';
import {LoaderService} from '../../Common/Loader';
import {AddCommentDialogComponent} from '../add-comment-dialog/add-comment-dialog.component';
import {AlwaysAskNotificationsComponent} from '../always-ask-notifications/always-ask-notifications.component';
import {AddContactDialogComponent} from '../../Contact/add-contact-dialog/add-contact-dialog.component';
import {Router} from '@angular/router';
import {AddEntityDialogComponent} from '../../Entities/add-entity-dialog/add-entity-dialog.component';
import {UploadService} from '../../Uploads/upload.service';
import {RequiredDocumentsService} from '../../RequiredDocuments/required-documents.service';
import * as FileSave from 'file-saver';
import * as FileSaver from 'file-saver';


@Component({
  selector: 'app-file-table',
  templateUrl: './file-table.component.html',
  styleUrls: ['./file-table.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px'})),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ],
  /*animations: [
    trigger('detailExpand', [
      state('void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('*', style({ height: '*', visibility: 'visible' })),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],*/
})
export class FileTableComponent implements OnInit {
  /*displayedColumns: string[] = ['action', 'fileRef', 'secretary', 'created', 'updated', 'actions'];
  dataSource;
  uploads: any[];
  reqDocs: any[];
  files;
  archFiles;
  archived;
  expandedElement: File | null;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;*/
  uploads: any[];
  reqDocs: any[];
  archFiles;
  archived;
  files: File[];
  dataSource;
  columnsToDisplay: string[] = ['action', 'fileRef', 'secretary', 'created', 'updated', 'actions'];
  expandedElement: File | null;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isExpansionDetailRow = (index, row) => row.hasOwnProperty('detailRow');

  constructor(
    private fileService: FileService,
    private matSnack: MatSnackBar,
    public loaderService: LoaderService,
    private dialog: MatDialog,
    private router: Router,
    private uploadService: UploadService,
    private reqDocService: RequiredDocumentsService
  ) {}

  ngOnInit() {
    this.fileService.getMyFiles(false)
      .subscribe(res => {
        this.files = res;
        this.dataSource = new MatTableDataSource<File>(this.files);
        this.initDataSource();
      }, err => {
        console.log(err);
      });
  }

  initDataSource() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'created':
          return new Date(item.createdAt);
        case 'updated':
          return new Date(item.updatedAt);
        default:
          return item[property];
      }
    };
    this.dataSource.filterPredicate =
      (data: File, filters: string) => {
        if (!data.updatedBy) {
          delete data.updatedBy;
        }
        if (!data.createdBy) {
          delete data.createdBy;
        }
        const matchFilter = [];
        const filterArray = filters.split('+');
        // slim down objects to only filterable fields
        const tempData = JSON.parse(JSON.stringify(data));
        if (tempData.contacts) {
          tempData.contacts.forEach(ct => {
            delete ct._id;
            delete ct.passwordHash;
            delete ct.verified;
            delete ct.type;
            delete ct._v;
          });
        }
        if (tempData.milestoneList.milestones) {
          tempData.milestoneList.milestones.forEach(m => {
            delete m.completed;
            delete m.comments;
            if (!m.updatedBy) {
              delete m.updatedBy;
            } else {
              delete m.updatedBy._id;
            }
            delete m._id;
          });
        }

        tempData.milestoneList._id = tempData.milestoneList._id.title;
        delete tempData._id;
        delete tempData.updatedBy;
        delete tempData.createdBy;
        delete tempData._v;
        const columns = (<any>Object).values(this.flatten(tempData));
        // console.log(tempData);
        // OR be more specific [data.name, data.race, data.color];
        // console.log(columns);
        // Main
        filterArray.forEach(filter => {
          const customFilter = [];
          columns.forEach(column => {
            if (column && typeof column === 'string') {
              customFilter.push(column.toLowerCase().includes(filter));
            }
          });
          matchFilter.push(customFilter.some(Boolean)); // OR
        });
        return matchFilter.every(Boolean);
      };
  }
  numCards(file) {
    return file.contacts.length <= 3 ? '' : '-4';
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
  reduceContacts(contacts) {
    return contacts.map(ct => ct.name).toString().replace(',', ',\n');
  }
  markMilestone(e, m, file, chBx) {
    const fileID = file._id;
    const thisMilestoneIndex = file.milestoneList.milestones.indexOf(m);
    if (e.checked) {
      if (m._id.alwaysAsk) { // check always ask for notifications property bring up popup modal
        const dialConfig = new MatDialogConfig();
        dialConfig.disableClose = true;
        dialConfig.autoFocus = true;
        dialConfig.minWidth = 300;
        dialConfig.data = {milestone: m._id, contacts: file.contacts};
        const dialogRef = this.dialog.open(AlwaysAskNotificationsComponent, dialConfig);
        dialogRef.afterClosed().subscribe(notiProps => {
          if (notiProps) {
            if (confirm('Are you sure you want to mark this milestone as done?')) {
              this.fileService.completeMilestone(fileID, m._id, notiProps)
                .subscribe(res => {
                  if (res.message) {
                    m.completed = e.checked;
                    this.matSnack.open(res.message);
                    if (thisMilestoneIndex === file.milestoneList.milestones.length - 1) { // if last milestone ask to send to archived
                      console.log('this is last milestone');
                      if (confirm('You have completed the last milestone, do you want to archive this file?')) {
                        this.archiveFile(file);
                      }
                    }
                  }
                });
            } else {
              e.checked = !e.checked;
              m.completed = e.checked;
              chBx.checked = false;
            }
          } else {
            e.checked = !e.checked;
            m.completed = e.checked;
            chBx.checked = false;
          }
        });
      } else {
        if (confirm('Are you sure you want to mark this milestone as done?')) {
          this.fileService.completeMilestone(fileID, m._id)
            .subscribe(res => {
              if (res.message) {
                m.completed = e.checked;
                this.matSnack.open(res.message);
                if (thisMilestoneIndex === file.milestoneList.milestones.length - 1) { // if last milestone ask to send to archived
                  if (confirm('You have completed the last milestone, do you want to archive this file?')) {
                    this.archiveFile(file);
                  }
                }
              }
            });
        } else {
          e.checked = !e.checked;
          m.completed = e.checked;
          chBx.checked = false;
        }
      }
    }
  }
  convertDate(inputFormat, d) {
    d = new Date(d);
    function pad(s) { return (s < 10) ? '0' + s : s; }
    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
  }
  addComment(mID, mNum, file) {
    const dialConfig = new MatDialogConfig();
    dialConfig.disableClose = true;
    dialConfig.autoFocus = true;
    dialConfig.minWidth = 300;
    dialConfig.data = { contacts: file.contacts };
    const dialogRef = this.dialog.open(AddCommentDialogComponent, dialConfig);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.fileService.addComment(file._id, mID._id._id, res)
          .subscribe((comment) => {
            if (comment) {
              mID.comments.push(comment);
            }
          });
      }
    });
  }
  addSummary(file) {
    const dialConfig = new MatDialogConfig();
    dialConfig.disableClose = true;
    dialConfig.autoFocus = true;
    dialConfig.minWidth = 300;
    dialConfig.data = { contacts: file.contacts, summary: true };
    const dialogRef = this.dialog.open(AddCommentDialogComponent, dialConfig);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.fileService.addSummary(file._id, res)
          .subscribe(summary => {
            file.summaries.push(summary);
          }, err => {
            console.log(err);
          });
      }
    });
  }
  gotoEditFile(fileID) {
    this.router.navigate(['/add-file', fileID]);
  }
  // TODO: Update milestone propogates to file?

  // ============== HELPER FUNCTIONS ================
  dive(currentKey, into, target) {
    for (const i in into) {
      if (into.hasOwnProperty(i)) {
        let newKey = i;
        const newVal = into[i];

        if (currentKey.length > 0) {
          newKey = currentKey + '.' + i;
        }

        if (typeof newVal === 'object') {
          this.dive(newKey, newVal, target);
        } else {
          target[newKey] = newVal;
        }
      }
    }
  }
  secretaryString(secs) {
    return secs.map(s => s.name).toString().replace(',', ', ');
  }
  flatten(arr) {
    const newObj = {};
    this.dive('', arr, newObj);
    return newObj;
  }
  archiveFile(file) {
    if (!file.archived) {
      if (confirm('Are you sure you want to archive this file?')) {
        this.fileService.updateFile({_id: file._id, archived: !file.archived})
          .subscribe(res => {
            if (res) {
              const i = this.files.findIndex(f => f._id === res._id);
              this.files[i].archived = res.archived;
              if (this.archFiles) { // if archived files have been fetched, add this file to archived array
                this.archFiles.unshift(this.files[i]);
              }
              this.files.splice(i, 1);
              this.dataSource = new MatTableDataSource<File>(this.files);
              this.initDataSource();
              this.matSnack.open('File has successfully been archived');
            } else {
              this.matSnack.open('Archive not successful');
            }
          });
      }
    } else {
      if (confirm('Are you sure you want to restore this file?')) {
        this.fileService.updateFile({_id: file._id, archived: !file.archived})
          .subscribe(res => {
            if (res) {
              const i = this.archFiles.findIndex(f => f._id === res._id);
              this.archFiles[i].archived = res.archived;
              this.files.unshift(this.archFiles[i]);
              this.archFiles.splice(i, 1);
              this.dataSource = new MatTableDataSource<File>(this.archFiles);
              this.initDataSource();
              this.matSnack.open('File has successfully been restored');
            } else {
              this.matSnack.open('Restore not successful');
            }
          });
      }
    }
  }
  showArchived() {
    this.dataSource = null;
    if (!this.archFiles) {
      this.fileService.getMyFiles(true)
        .subscribe(res => {
          this.archFiles = res;
          this.dataSource = new MatTableDataSource<File>(this.archFiles);
          this.initDataSource();
        }, err => {
          console.log(err);
        });
    } else {
      this.dataSource = new MatTableDataSource<File>(this.archFiles);
      this.initDataSource();
    }
  }
  hideArchived() {
    this.dataSource = null;
    this.dataSource = new MatTableDataSource<File>(this.files);
    this.initDataSource();
  }
  editContact(ct) {
    this.createNewContactDialog(ct);
  }
  createNewContactDialog(ct) {
    const dialConfig = new MatDialogConfig();
    dialConfig.disableClose = true;
    dialConfig.autoFocus = true;
    dialConfig.minWidth = 200;
    dialConfig.data = ct;
    const dialogRef = this.dialog.open(AddContactDialogComponent, dialConfig);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        window.location.reload(true);
      }
    });
  }
  editEntity(e) {
    console.log(e);
    const dialConfig = new MatDialogConfig();
    dialConfig.disableClose = true;
    dialConfig.autoFocus = true;
    const entity = {...e};
    entity.contacts = entity.contacts.map(c => {
      return {_id: c._id, name: c.name + ' ' + c.surname};
    });
    dialConfig.data = {
      entity: entity
    };
    const dialogRef = this.dialog.open(AddEntityDialogComponent, dialConfig);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        window.location.reload(true);
      }
    });
  }
  getUploads() {
    if (!this.uploads) {
      this.uploadService.getAllUploadsFile()
        .subscribe(res => {
          if (res.length > 0) {
            res = res.map(u => {
              if (u.mimeType.substring(0, u.mimeType.indexOf('/')) === 'image') {
                u.path = 'data:' + u.mimeType + ';base64,' + u.path;
                return u;
              } else {
                return u;
              }
            });
            this.uploads = res;
            return true;
          } else {
            return false;
          }
        }, err => {
          console.log(err);
        });
    }
  }
  numUploads(fid) {
    if (this.uploads && this.reqDocs) {
      const numUploads = this.uploads.filter(u => u.fileID === fid).length;
      if (numUploads > 0) { // if file has uploads build required Documents / uploads structure.
        this.reqDocsPerFile(fid);
      }
      return  numUploads;
    }
  }
  getFileUploads(fid) {
    return this.uploads.filter(u => u.fileID === fid);
  }
  reqDocsPerFile(fid) { // sort required documents in files and add relevant uploads to them to display
    const thisFile = this.archived ? this.archFiles.find(f => f._id === fid) : this.files.find(f => f._id === fid);
    if (!thisFile.requiredDocuments) {
      thisFile.requiredDocuments = [];
      const uploadsInFile = this.getFileUploads(fid);
      const newReqDocs = JSON.parse(JSON.stringify(this.reqDocs));
      newReqDocs.forEach(rd => {
        rd.uploads = [];
        rd.uploads = uploadsInFile.filter(u => u.requiredDocumentID._id === rd._id);
      });
      thisFile.requiredDocuments = newReqDocs.filter(rd => rd.uploads.length > 0);
      this.files = this.files.map(f => f._id === fid ? thisFile : f);
    }
  }
  getRequiredDocs() {
    if (!this.reqDocs) {
      this.reqDocService.getAllReqDocs()
        .subscribe(res => {
          if (res) {
            this.reqDocs = res;
          }
        }, err => {
          if (err) {
            console.log(err);
          }
        });
    }
  }
  getFile(row) {
    if (row !== this.expandedElement) {
      this.fileService.getFileForAdmin(row._id)
        .subscribe(file => {
          if (file) {
            this.files = this.files.map(f => f._id === file._id ? file : f);
            const rowIndex = this.dataSource.data.indexOf(row);
            this.dataSource.data = this.files;
            this.expandedElement = this.dataSource.data[rowIndex];
            this.initDataSource();
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
}

export interface File {
  _id: string;
  fileRef: string;
  action: string;
  userRef: string;
  milestoneList?: MilestoneList;
  contacts?: [any];
  propertyDescription: string;
  updatedBy: any;
  createdBy: any;
  updatedAt: any;
  createdAt: any;
  archived: boolean;
  entity?: any;
  _v: any;
  requiredDocuments?: any;
  fullFile?: boolean;
}
export interface MilestoneList {
  _id: any;
  milestones: [Milestone];
}

export interface Milestone {
  _id: string;
  name: string;
  number: number;
  notificationMessage: string;
  sendEmail: boolean;
  sendSms: boolean;
  updatedAt: any;
  updatedBy: any;
  comments: [{
    user: any;
    comment: string;
  }];
  completed: boolean;
}


export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  description: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    position: 1,
    name: 'Hydrogen',
    weight: 1.0079,
    symbol: 'H',
    description: `Hydrogen is a chemical element with symbol H and atomic number 1. With a standard
        atomic weight of 1.008, hydrogen is the lightest element on the periodic table.`
  }, {
    position: 2,
    name: 'Helium',
    weight: 4.0026,
    symbol: 'He',
    description: `Helium is a chemical element with symbol He and atomic number 2. It is a
        colorless, odorless, tasteless, non-toxic, inert, monatomic gas, the first in the noble gas
        group in the periodic table. Its boiling point is the lowest among all the elements.`
  }, {
    position: 3,
    name: 'Lithium',
    weight: 6.941,
    symbol: 'Li',
    description: `Lithium is a chemical element with symbol Li and atomic number 3. It is a soft,
        silvery-white alkali metal. Under standard conditions, it is the lightest metal and the
        lightest solid element.`
  }, {
    position: 4,
    name: 'Beryllium',
    weight: 9.0122,
    symbol: 'Be',
    description: `Beryllium is a chemical element with symbol Be and atomic number 4. It is a
        relatively rare element in the universe, usually occurring as a product of the spallation of
        larger atomic nuclei that have collided with cosmic rays.`
  }, {
    position: 5,
    name: 'Boron',
    weight: 10.811,
    symbol: 'B',
    description: `Boron is a chemical element with symbol B and atomic number 5. Produced entirely
        by cosmic ray spallation and supernovae and not by stellar nucleosynthesis, it is a
        low-abundance element in the Solar system and in the Earth's crust.`
  }, {
    position: 6,
    name: 'Carbon',
    weight: 12.0107,
    symbol: 'C',
    description: `Carbon is a chemical element with symbol C and atomic number 6. It is nonmetallic
        and tetravalent—making four electrons available to form covalent chemical bonds. It belongs
        to group 14 of the periodic table.`
  }, {
    position: 7,
    name: 'Nitrogen',
    weight: 14.0067,
    symbol: 'N',
    description: `Nitrogen is a chemical element with symbol N and atomic number 7. It was first
        discovered and isolated by Scottish physician Daniel Rutherford in 1772.`
  }, {
    position: 8,
    name: 'Oxygen',
    weight: 15.9994,
    symbol: 'O',
    description: `Oxygen is a chemical element with symbol O and atomic number 8. It is a member of
         the chalcogen group on the periodic table, a highly reactive nonmetal, and an oxidizing
         agent that readily forms oxides with most elements as well as with other compounds.`
  }, {
    position: 9,
    name: 'Fluorine',
    weight: 18.9984,
    symbol: 'F',
    description: `Fluorine is a chemical element with symbol F and atomic number 9. It is the
        lightest halogen and exists as a highly toxic pale yellow diatomic gas at standard
        conditions.`
  }, {
    position: 10,
    name: 'Neon',
    weight: 20.1797,
    symbol: 'Ne',
    description: `Neon is a chemical element with symbol Ne and atomic number 10. It is a noble gas.
        Neon is a colorless, odorless, inert monatomic gas under standard conditions, with about
        two-thirds the density of air.`
  },
];
