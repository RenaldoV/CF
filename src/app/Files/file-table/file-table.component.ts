import {ViewChild, Component, OnInit, Input} from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { of } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';
import {MatTableDataSource, MatSort, MatPaginator, MatSnackBar, MatDialogConfig, MatDialog} from '@angular/material';
import {FileService} from '../file.service';
import {LoaderService} from '../../Loader';
import {AddContactDialogComponent} from '../add-contact-dialog/add-contact-dialog.component';
import {AddCommentDialogComponent} from '../add-comment-dialog/add-comment-dialog.component';

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
  displayedColumns: string[] = ['action', 'fileRef', 'ourRef', 'ERF', 'created', 'updated', 'actions'];
  dataSource;
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
    this.dataSource = new MatTableDataSource<File>(this.files);
    console.log(this.files);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'created': return new Date(item.createdAt);
        case 'updated': return new Date(item.updatedAt);
        default: return item[property];
      }
    };
    /*this.dataSource.filterPredicate =
      (data: File, filters: string) => {
        const matchFilter = [];
        const filterArray = filters.split('+');
        // const columns = (<any>Object).values(data);
        console.log(data);
        // OR be more specific [data.name, data.race, data.color];

        // Main
        /!*filterArray.forEach(filter => {
          const customFilter = [];
          columns.forEach(column => customFilter.push(column.toLowerCase().includes(filter)));
          matchFilter.push(customFilter.some(Boolean)); // OR
        });
        return matchFilter.every(Boolean); // AND*!/
      };*/
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  reduceContacts(contacts) {
    return contacts.map(ct => ct.name).toString().replace(',', ',\n');
  }
  markMilestone(e, m, fileID) {
    if (e.checked) {
      if (confirm('Are you sure you want to mark this milestone as done?')) {
        console.log('mark milestone ' + m._id + ' as completed: ' + e.checked);
        this.fileService.completeMilestone(fileID, m._id)
          .subscribe(res => {
            if (res.message) {
              m.completed = e.checked;
              this.matSnack.open(res.message);
            }
          });
      } else {
        m.complete = !e.checked;
      }
    } /*else {
      if (confirm('Are you sure you want to mark this milestone as not done?')) {
        console.log('mark milestone ' + m._id + ' as completed: ' + e.checked);
        m.complete = e.checked;
      } else {
        m.complete = !e.checked;
      }
    }*/
  }
  convertDate(inputFormat, d) {
    d = new Date(d);
    function pad(s) { return (s < 10) ? '0' + s : s; }
    return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
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
              console.log(mID);
              console.log(comment);
              mID.comments.push(comment);
            }
          });
      }
    });
  }
  // TODO: Update, delete file
  // TODO: Update milestone propogates to file?
}

export interface File {
  fileRef: string;
  action: string;
  ourRef: string;
  milestoneList: MilestoneList;
  contacts: [any];
  erfNumber: string;
  updatedBy: any;
  createdBy: any;
  updatedAt: any;
  createdAt: any;
}
export interface MilestoneList {
  title: string;
  updatedBy: any;
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
  complete: boolean;
}


