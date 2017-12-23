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

const appRoutes: Routes = [
  { path: 'games/decoder', component: DecoderComponent },
  { path: 'games/jigsaw', component: JigsawComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    NavAccordianComponent,
    PageNotFoundComponent,
    ],
  imports: [
    BrowserModule,
    CommonModule ,
    HttpModule,
    GamesModule,
    Angular2FontawesomeModule ,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
