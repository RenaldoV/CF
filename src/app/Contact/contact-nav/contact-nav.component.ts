import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../auth/auth.service';
import {ActivatedRoute, ActivatedRouteSnapshot, Router} from '@angular/router';
import {FileService} from '../../Files/file.service';

@Component({
  selector: 'app-contact-nav',
  templateUrl: './contact-nav.component.html',
  styleUrls: ['./contact-nav.component.css']
})
export class ContactNavComponent implements OnInit {
  fileref;
  fileID;
  userID;
  entityID;
  routeName;
  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fileService: FileService
  ) { }

  ngOnInit() {
    this.routeName = this.router.url;
    this.routeName = this.routeName.split('/')[1];
    if (this.routeName === 'entity') {
      this.entityID = this.route.snapshot.paramMap.get('id');
      this.userID = this.auth.getID();
    } else {
      this.fileID = this.route.snapshot.paramMap.get('id');
      this.userID = this.auth.getID();
      this.fileService.getFileRef(this.fileID)
        .subscribe(res => {
          if (res.fileRef) {
            this.fileref = res.fileRef;
          }
        });
    }
  }
  logout() {
    this.auth.destroySession();
    if (this.entityID) {
      this.router.navigate(['/entity-login', this.entityID, this.userID]);
    } else {
      this.router.navigate(['/login', this.fileID, this.userID]);
    }
  }
  getName() {
    return this.auth.getName();
  }

}
