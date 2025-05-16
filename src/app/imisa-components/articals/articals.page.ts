import { Component, OnInit } from "@angular/core";
import { Router, NavigationExtras } from "@angular/router";
import { BoundPcatCode } from "../../models/bound-pcat-code";
import { BoundPcatService } from "../../imisa-services/bound-pcat.service";
import { CommonService } from "../../imisa-services/common.service";

@Component({
  selector: "app-articals",
  templateUrl: "./articals.page.html",
  styleUrls: ["./articals.page.scss"],
  standalone: false,
})
export class ArticalsPage implements OnInit {
  arrArticals: BoundPcatCode[] = [];

  constructor(
    private router: Router,
    private boundPcatService: BoundPcatService,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.populateAllArticals();
  }

  ionViewWillEnter() {
    this.commonService.currentPresentedPage = "artilcals";
  }

  showArticalList(artical: BoundPcatCode) {
    this.commonService.CURRNET_BOUND_PCAT_CODE = artical.boundPCatCode;
    let navExtras: NavigationExtras = {
      queryParams: {
        boundPcat: JSON.stringify(artical),
      },
    };

    this.router.navigate(["tabs/articals/artical-list"], navExtras);
  }

  populateAllArticals() {
    this.boundPcatService.getArticals().then((x) => {
      this.arrArticals = x;
    });
  }
}
