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
  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fileService: FileService
  ) { }

  ngOnInit() {
    this.fileID = this.route.snapshot.paramMap.get('id');
    this.userID = this.auth.getID();
    this.fileService.getFileRef(this.fileID)
      .subscribe(res => {
        if (res.fileRef) {
          this.fileref = res.fileRef;
        }
      });
  }
  logout() {
    this.auth.destroySession();
    this.router.navigate(['/login', this.fileID, this.userID]);
  }
  getName() {
    return this.auth.getName();
  }

}
