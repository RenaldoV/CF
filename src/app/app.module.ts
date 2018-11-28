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
  MatAutocompleteModule, MatCardModule, MatCheckboxModule, MatDialogModule, MatExpansionModule,
  MatFormFieldModule, MatIconModule,
  MatInputModule, MatMenuModule, MatPaginatorModule, MatRadioModule,
  MatSelectModule, MatSnackBarModule, MatSortModule,
  MatStepperModule, MatTableModule, MatTooltipModule
} from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminHomeComponent } from './Admin/admin-home/admin-home.component';
import { NavComponent } from './nav/nav.component';
import { AddFileComponent } from './Files/add-file/add-file.component';
import { AdminSetupComponent } from './Admin/admin-setup/admin-setup.component';
import {LoaderModule} from './Loader';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { AddContactDialogComponent } from './Files/add-contact-dialog/add-contact-dialog.component';
import { FileTableComponent } from './Common/file-table/file-table.component';
import {CdkDetailRowDirective} from './Common/file-table/cdk-detail-row.directive';



@NgModule({
  declarations: [
    AppComponent,
    AdminLogInComponent,
    AdminHomeComponent,
    NavComponent,
    AddFileComponent,
    AdminSetupComponent,
    AddContactDialogComponent,
    FileTableComponent,
    CdkDetailRowDirective
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
    MatDialogModule,
    MatMenuModule,
    MatCardModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatIconModule,
    MatSortModule,
    MatTableModule,
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
  bootstrap: [AppComponent],
  entryComponents: [AddContactDialogComponent]
})
export class AppModule { }
