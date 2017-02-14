import { NgModule } from '@angular/core';

import {
  AdalService,
  AdalHttpService
} from './service';

@NgModule({
  providers: [
    AdalService,
    AdalHttpService
  ]
})
export class AdalModule { }
