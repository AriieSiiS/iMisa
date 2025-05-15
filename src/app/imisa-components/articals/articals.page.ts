import { Component, OnInit } from '@angular/core';
import { Routes, Router, NavigationExtras } from '@angular/router';
import { BoundPcatCode } from 'src/app/models/bound-pcat-code';
import { BoundPcatService } from 'src/app/imisa-services/bound-pcat.service';
import { CommonService } from 'src/app/imisa-services/common.service';

@Component({
  selector: 'app-articals',
  templateUrl: './articals.page.html',
  styleUrls: ['./articals.page.scss'],
})
export class ArticalsPage implements OnInit {

  constructor(private router: Router,
    private boundPcatCode: BoundPcatCode,
    private boundPcatService: BoundPcatService,
    private commonService:CommonService) { }

  arrArticals: BoundPcatCode[] = [];
 

  ngOnInit() {
    this.populateAllArticals();
  }

  ionViewWillEnter()
  {
   this.commonService.currentPresentedPage='artilcals';
  }

  showArticalList(artical:BoundPcatCode) {
    this.commonService.CURRNET_BOUND_PCAT_CODE =artical.boundPCatCode;
    let navExtras :NavigationExtras= {
      queryParams:{
        "boundPCat":JSON.stringify(artical)
      }
    }

   // this.router.navigateByUrl('tabs/articals/2');
    this.router.navigate(['tabs/articals/artical-list'],navExtras);// ('tabs/articals/artical-list');
  }

  populateAllArticals() {
     this.boundPcatService.getArticals().then(x=>{
      this.arrArticals =x
     });
  }
}
