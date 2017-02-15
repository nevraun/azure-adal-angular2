import { NgModule } from '@angular/core';

import { AdalService } from './adal.service';
import { AdalHttpService } from './adal-http.service';

@NgModule({
  providers: [
    AdalService,
    AdalHttpService
  ]
})
export class AdalModule { }
