import { JigsawComponent } from './games/jigsaw/jigsaw.component';
import { NavAccordianComponent } from './nav-accordian/nav-accordian.component';
import { GamesModule } from './games/games.module';
import { PageNotFoundComponent } from './PageNotFound/pagenotfound.component';
import { DecoderComponent } from './games/decoder/decoder.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome';
import { ProfileComponent } from './user/profile/profile.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

const appRoutes: Routes = [
  { path: 'games/decoder', component: DecoderComponent },
  { path: 'games/jigsaw', component: JigsawComponent },
  { path: 'user/profile', component: ProfileComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    NavAccordianComponent,
    PageNotFoundComponent,
    ProfileComponent,
    ],
  imports: [
    BrowserModule,
    CommonModule ,
    HttpModule,
    GamesModule,
    FormsModule,
    ReactiveFormsModule,
    Angular2FontawesomeModule ,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
    LoggerModule.forRoot({serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.DEBUG, serverLogLevel: NgxLoggerLevel.ERROR})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
