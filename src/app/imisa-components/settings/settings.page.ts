import { Component, OnInit } from '@angular/core';
import { Accounts } from 'src/app/models/accounts';
import { AccountService } from 'src/app/imisa-services/account.service';
import { CommonService } from 'src/app/imisa-services/common.service';
import { NativestorageService } from 'src/app/imisa-services/nativestorage.service';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  arrAccounts: Accounts[];
  canScanUsingCamera: boolean = false;
  defultOrderAccountNumber:string='';
  userName:string='';
  constructor(private accountService: AccountService, 
    private commonService:CommonService,
    private nativeStorageService:NativestorageService) { }

  async ngOnInit() {
   
  }

 async ionViewWillEnter()
  {
    this.commonService.currentPresentedPage='settings';
    await this.populateAccounts();
    await this.commonService.isCamaraScanningEnabled().then(x=>{ this.canScanUsingCamera =x;} );
    await this.commonService.getOrderAccountNumber().then(x=>{this.defultOrderAccountNumber=x;});
    
    try {
      await this.nativeStorageService.getNativeValue(this.commonService.USER_INITIAL).then(async (x) => {
        this.userName=x;
      });
    } catch (error) {
      this.userName="";
    }
    
  }

 async populateAccounts() {
    this.arrAccounts = await this.accountService.getAccounts();
  }

  accoutVal(index: number, item: any)
  {
    return item.value;
  }
  
  async saveAccounts(event)
  {
   await this.nativeStorageService.setNativeValue(this.commonService.ORDER_ACCOUNT_NUMBER,event.detail.value)
  }
  async saveUserInitial(event)
  {
   await this.nativeStorageService.setNativeValue(this.commonService.USER_INITIAL,event.detail.value)
  }

  async SaveCameraScanSetting(event)
  {
    this.commonService.canUseCameraScanning=this.canScanUsingCamera;
    
    await this.nativeStorageService.setNativeValue(this.commonService.ENABLE_CAMERA_SCANNER,this.canScanUsingCamera)
   // this.commonService.canScanUsingCamera=this.canScanUsingCamera;
  }

}
