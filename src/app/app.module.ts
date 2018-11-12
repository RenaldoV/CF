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
  MatAutocompleteModule, MatCardModule, MatCheckboxModule, MatExpansionModule,
  MatFormFieldModule, MatIconModule,
  MatInputModule,
  MatSelectModule,
  MatStepperModule, MatTooltipModule
} from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminHomeComponent } from './Admin/admin-home/admin-home.component';
import { NavComponent } from './nav/nav.component';
import { AddFileComponent } from './Files/add-file/add-file.component';
import { AdminSetupComponent } from './Admin/admin-setup/admin-setup.component';
import {LoaderModule} from './Loader';



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
    MatTooltipModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatStepperModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    LoaderModule
  ],
  providers: [
    AuthService,
    WINDOW_PROVIDERS
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
