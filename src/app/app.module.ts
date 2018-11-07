import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { AppRoutingModule } from './app-routing.module';
import { WINDOW_PROVIDERS } from './window.service';
import { AdminLogInComponent } from './log-in/admin-log-in.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatAutocompleteModule, MatExpansionModule,
  MatFormFieldModule, MatIconModule,
  MatInputModule,
  MatSelectModule,
  MatStepperModule
} from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { NavComponent } from './nav/nav.component';
import { AddFileComponent } from './add-file/add-file.component';
import { AdminSetupComponent } from './admin-setup/admin-setup.component';


@NgModule({
  declarations: [
    AppComponent,
    AdminLogInComponent,
    AdminHomeComponent,
    NavComponent,
    AddFileComponent,
    AdminSetupComponent
  ],
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatStepperModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatExpansionModule,
    MatIconModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule
  ],
  providers: [
    AuthService,
    WINDOW_PROVIDERS
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
