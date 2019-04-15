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
    const d = new Date(date);
    return [d.getDate(), d.getMonth() + 1, d.getFullYear()]
      .map(n => n < 10 ? `0${n}` : `${n}`).join('/');
  }

}

// TODO: BUG last comments doesn't always load correctly
