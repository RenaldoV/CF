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
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatAutocompleteModule, MatCardModule, MatCheckboxModule, MatExpansionModule,
  MatFormFieldModule, MatIconModule,
  MatInputModule, MatRadioModule,
  MatSelectModule, MatSnackBarModule,
  MatStepperModule, MatTooltipModule
} from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminHomeComponent } from './Admin/admin-home/admin-home.component';
import { NavComponent } from './nav/nav.component';
import { AddFileComponent } from './Files/add-file/add-file.component';
import { AdminSetupComponent } from './Admin/admin-setup/admin-setup.component';
import {LoaderModule} from './Loader';
import {DragDropModule} from '@angular/cdk/drag-drop';



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
    MatRadioModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    DragDropModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    LoaderModule
  ],
  providers: [
    AuthService,
    WINDOW_PROVIDERS,
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue:  {duration: 3000}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
