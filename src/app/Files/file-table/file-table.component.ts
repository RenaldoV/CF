import {ViewChild, Component, OnInit, Input, ChangeDetectorRef} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import {MatTableDataSource, MatSort, MatPaginator, MatSnackBar, MatDialogConfig, MatDialog} from '@angular/material';
import {FileService} from '../file.service';
import {LoaderService} from '../../Common/Loader';
import {AddCommentDialogComponent} from '../add-comment-dialog/add-comment-dialog.component';
import {AlwaysAskNotificationsComponent} from '../always-ask-notifications/always-ask-notifications.component';
import {AddContactDialogComponent} from '../add-contact-dialog/add-contact-dialog.component';


@Component({
  selector: 'app-file-table',
  templateUrl: './file-table.component.html',
  styleUrls: ['./file-table.component.css'],
  animations: [
    trigger('detailExpand', [
      state('void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('*', style({ height: '*', visibility: 'visible' })),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class FileTableComponent implements OnInit {
  displayedColumns: string[] = ['action', 'fileRef', 'secretary', 'created', 'updated', 'actions'];
  dataSource;
  archived = false;
  allFiles: any[];
  @Input() files;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isExpansionDetailRow = (index, row) => row.hasOwnProperty('detailRow');

  constructor(
    private fileService: FileService,
    private matSnack: MatSnackBar,
    public loaderService: LoaderService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.allFiles = this.files;
    this.dataSource = new MatTableDataSource<File>(this.files.filter(f => !f.archived));
    /*console.log(this.files);*/
    this.initDataSource();
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
        const matchFilter = [];
        const filterArray = filters.split('+');
        // slim down objects to only filterable fields
        const tempData = JSON.parse(JSON.stringify(data));
        tempData.contacts.forEach(ct => {
          delete ct._id;
          delete ct.passwordHash;
          delete ct.verified;
          delete ct.type;
          delete ct._v;
        });
        tempData.milestoneList.milestones.forEach(m => {
          delete m.completed;
          delete m.comments;
          delete m.updatedBy._id;
          delete m._id;
        });
        tempData.milestoneList._id = tempData.milestoneList._id.title;
        delete tempData._id;
        delete tempData.updatedBy._id;
        delete tempData.createdBy._id;
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
    return file.contacts.length + 1 <= 3 ? '' : '-4';
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
      if (m._id.alwaysAsk) { // check always ask for notifications property
        // bring up popup modal
        const dialConfig = new MatDialogConfig();
        dialConfig.disableClose = true;
        dialConfig.autoFocus = true;
        dialConfig.minWidth = 300;
        dialConfig.data = m._id;
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
      }
    }
  }
  convertDate(inputFormat, d) {
    d = new Date(d);
    function pad(s) { return (s < 10) ? '0' + s : s; }
    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
  }
  addComment(mID, mNum, fileID) {
    const dialConfig = new MatDialogConfig();
    dialConfig.disableClose = true;
    dialConfig.autoFocus = true;
    dialConfig.minWidth = 300;
    const dialogRef = this.dialog.open(AddCommentDialogComponent, dialConfig);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.fileService.addComment(fileID, mID._id._id, res)
          .subscribe((comment) => {
            if (comment) {
              mID.comments.push(comment);
            }
          });
      }
    });
  }
  // TODO: Update file
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
              const i = this.allFiles.findIndex(f => f._id === res._id);
              this.allFiles[i].archived = res.archived;
              this.dataSource = new MatTableDataSource<File>(this.allFiles.filter(f => !f.archived));
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
              const i = this.allFiles.findIndex(f => f._id === res._id);
              this.allFiles[i].archived = res.archived;
              this.dataSource = new MatTableDataSource<File>(this.allFiles.filter(f => f.archived));
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
    this.dataSource = new MatTableDataSource<File>(this.allFiles.filter(f => f.archived));
    this.initDataSource();
  }
  hideArchived() {
    this.dataSource = new MatTableDataSource<File>(this.allFiles.filter(f => !f.archived));
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

}

export interface File {
  _id: string;
  fileRef: string;
  action: string;
  userRef: string;
  milestoneList: MilestoneList;
  contacts: [any];
  propertyDescription: string;
  updatedBy: any;
  createdBy: any;
  updatedAt: any;
  createdAt: any;
  archived: boolean;
  _v: any;
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


