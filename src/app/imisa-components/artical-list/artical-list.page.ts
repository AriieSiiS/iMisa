import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ProductService } from "../../imisa-services/product.service";
import { Product } from "../../models/product";
import { BoundPcatCode } from "../../models/bound-pcat-code";
import { Order } from "../../models/order";
import { OrderService } from "../../imisa-services/order.service";
import { CommonService } from "../../imisa-services/common.service";
import { List } from "linqts";

@Component({
  selector: "app-artical-list",
  templateUrl: "./artical-list.page.html",
  styleUrls: ["./artical-list.page.scss"],
  standalone: false,
})
export class ArticalListPage implements OnInit {
  boundPcatCode: number = 0;
  arrArticalsItem: Product[] = [];
  arrArticalsItemMaster: Product[] = [];
  IsWildSearchActive: boolean = false;
  searchValue = "";
  boundPcat: BoundPcatCode = new BoundPcatCode();
  canScanUsingCamera: boolean = false;
  defaultBackLink = "/tabs/articals";

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private orderService: OrderService,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params["boundPcat"]) {
        const boundPcat = JSON.parse(params["boundPcat"]);
        this.boundPcat = boundPcat;
      }
      this.populateArticals();
    });
  }

  ionViewWillEnter() {
    this.commonService.currentPresentedPage = "artilcal-list";
    if (this.router.url.startsWith("/wa-tabs")) {
      this.defaultBackLink = "/wa-tabs/order";
    } else {
      this.defaultBackLink = "/tabs/articals";
    }
  }

  editArtical(articalItem: Product) {
    articalItem.boundPCatagoryDescription = this.boundPcat.descinternal;

    if (this.router.url.startsWith("/wa-tabs")) {
      this.router.navigate(["/wa-tabs/order"], {
        queryParams: { code: articalItem.code },
      });
      return;
    }

    this.router.navigate(["tabs/articals/artical-list/edit-artical"], {
      queryParams: {
        code: articalItem.code,
        boundPCatCode: articalItem.boundPCatCode,
        boundPCatagoryDescription: articalItem.boundPCatagoryDescription,
        IsEditOrder: false,
      },
    });
  }

  async populateArticals() {
    this.productService
      .getProducts(this.boundPcat.boundPCatCode)
      .then((products) => {
        this.arrArticalsItem = products;
        this.arrArticalsItemMaster = products;
      })
      .catch((err) => {
        this.arrArticalsItem = [];
        this.arrArticalsItemMaster = [];
      });
  }

  async addArticalInOrder(artical: Product) {
    let order = new Order();
    order.code = artical.code;
    order.boundPCatCode = artical.boundPCatCode;
    order.productDescription = artical.descinternal;
    let orderAccountNo = this.commonService.getOrderAccountNumber();
    if (orderAccountNo) {
      order.accountno = (await orderAccountNo).toString();
    } else {
      order.accountno = "250";
    }
    order.amount = artical.defaultqty;
    order.deliverydays = 0;
    order.fid = 0;
    order.objectId = "MisaOrder";
    await this.orderService.addOrder(order).then(() => {
      this.commonService.showMessage("Artikel hinzugefügt!");
    });
  }

  ArticalItemSearch(searchVal: string) {
    if (!this.IsWildSearchActive) {
      this.arrArticalsItem = new List<Product>(this.arrArticalsItemMaster)
        .Where((x) =>
          x.descinternal.toLowerCase().startsWith(searchVal.toLowerCase())
        )
        .ToArray();
    } else {
      this.arrArticalsItem = new List<Product>(this.arrArticalsItemMaster)
        .Where((x) =>
          x.descinternal.toLowerCase().includes(searchVal.toLowerCase())
        )
        .ToArray();
    }
  }

  wildSearchToggleChange(e) {
    this.searchValue = "";
    this.arrArticalsItem = this.arrArticalsItemMaster;
  }
}
