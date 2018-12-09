import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogService } from './services/log.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [LogService]
})
export class LoggingModule { }
