import { Component, OnInit } from '@angular/core';
import {EntityService} from '../entity.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['./entity.component.css']
})
export class EntityComponent implements OnInit {
  entityID;
  entity;
  constructor(
    private entityService: EntityService,
    private route: ActivatedRoute
  ) {
    this.entityID = this.route.snapshot.paramMap.get('id');
    this.entityService.getEntityAndFiles(this.entityID)
      .subscribe(en => {
        if (en) {
          this.entity = en;
          this.entity.files.forEach(f => {
            f.milestoneList.milestones = f.milestoneList.milestones.filter(m => m.completed === true);
          });
          console.log(en);
        } else {
          alert('entity does not exists');
        }
      }, err => {
        console.log(err);
      });
  }

  ngOnInit() {
  }
  formatDate(date) {
    date = new Date(date);
    return date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
  }

}
