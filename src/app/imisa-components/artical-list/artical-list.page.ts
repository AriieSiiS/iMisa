import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { ProductService } from 'src/app/imisa-services/product.service';
import { Product } from 'src/app/models/product';
import { List } from 'linqts';
import { BoundPcatCode } from 'src/app/models/bound-pcat-code';
import { Order } from 'src/app/models/order';
import { OrderService } from 'src/app/imisa-services/order.service';
import { CommonService } from 'src/app/imisa-services/common.service';
// import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx'
@Component({
  selector: 'app-artical-list',
  templateUrl: './artical-list.page.html',
  styleUrls: ['./artical-list.page.scss'],
})
export class ArticalListPage implements OnInit {
  boundPcatCode: number = 0;
  arrArticalsItem: Product[] = [];
  arrArticalsItemMaster: Product[] = [];
  IsWildSearchActive: boolean = false;
  searchValue = '';
  boundPcat: BoundPcatCode = new BoundPcatCode();
  canScanUsingCamera: boolean = false;
  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private orderService: OrderService,
    private commonService: CommonService
  ) {
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(x => {
      if (typeof (x.boundPCat) !== typeof (undefined)) {
        //this.commonService.showLoader();
        this.boundPcat = JSON.parse(x["boundPCat"])
        this.populateArticals();
      } else {
        this.router.navigate['tabs/articals']
      }
    })
  }

  ionViewWillEnter() {
    this.commonService.currentPresentedPage = 'artilcal-list';
  }

  editArtical(articalItem: Product) {
    articalItem.boundPCatagoryDescription = this.boundPcat.descinternal;
    let navExtras: NavigationExtras = {
      queryParams: {
        "articalItmDtls": JSON.stringify(articalItem),
        "IsEditOrder": false
      }
    }

    this.router.navigate(['tabs/articals/artical-list/edit-artical'], navExtras)
  }

  populateArticals() {
    this.productService.getProducts(this.boundPcat.boundPCatCode).then((x => {
      this.arrArticalsItemMaster = x,
        this.arrArticalsItem = x
      //this.commonService.hideLoader();
    }));

  }

  async addArticalInOrder(artical: Product) {
    let order = new Order();
    // order.orderHistoryId = 0;
    order.code = artical.code;
    order.boundPCatCode = artical.boundPCatCode;
    order.productDescription=artical.descinternal;
    let orderAccountNo = this.commonService.getOrderAccountNumber();
    if (orderAccountNo) {
      order.accountno = (await orderAccountNo).toString();
    }
    else {
      order.accountno = '250';
    }
    //order.additionaldesc = artical.descinternal;
    order.amount = artical.defaultqty;
    order.deliverydays = 0; // TODO : fetch is from  setting table
    order.fid = 0;
    order.objectId = "MisaOrder";
    await this.orderService.addOrder(order).then(() => {
      this.commonService.showMessage('Order saved successfully !');
      // await this.commonService.showAlertMessage('Order saved successfully on server','Order'); 
    })
  }

  ArticalItemSearch(searchVal: string) {
    if (!this.IsWildSearchActive) {
      this.arrArticalsItem = new List<Product>(this.arrArticalsItemMaster)
        .Where(x => x.descinternal.toLowerCase().startsWith(searchVal.toLowerCase())).ToArray();
    }
    else {
      this.arrArticalsItem = new List<Product>(this.arrArticalsItemMaster)
        .Where(x => x.descinternal.toLowerCase().includes(searchVal.toLowerCase())).ToArray();
    }
  }

  wildSearchToggleChange(e) {
    this.searchValue = ''
    this.arrArticalsItem = this.arrArticalsItemMaster;
  }

  // ScanItem() {
  //   this.barcodeScanner.scan().then(res => {
  //     let articalItem = new List<Product>(this.arrArticalsItemMaster)
  //       .Where(y => y.code.toString() == res.text).FirstOrDefault();
  //     if (typeof articalItem !== typeof undefined) {
  //       this.addArticalInOrder(articalItem);
  //     }
  //     else {
  //       this.commonService.showErrorMessage('Scanned product not found')
  //     }
  //   });
  // }


}

