import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { AppRoutingModule } from './app-routing.module';
import { WINDOW_PROVIDERS } from './window.service';
import { AdminLogInComponent } from './Admin/admin-login/admin-log-in.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MAT_CHECKBOX_CLICK_ACTION, MAT_DIALOG_DEFAULT_OPTIONS,
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatAutocompleteModule, MatBadgeModule, MatCardModule, MatCheckboxModule, MatChipsModule, MatDialogModule, MatExpansionModule,
  MatFormFieldModule, MatIconModule,
  MatInputModule, MatMenuModule, MatPaginatorModule, MatProgressBarModule, MatRadioModule,
  MatSelectModule, MatSnackBarModule, MatSortModule,
  MatStepperModule, MatTableModule, MatTabsModule, MatTooltipModule
} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AdminHomeComponent } from './Admin/admin-home/admin-home.component';
import { AdminNavComponent } from './Admin/admin-nav/admin-nav.component';
import { AddFileComponent } from './Files/add-file/add-file.component';
import { AdminSetupComponent } from './Admin/admin-setup/admin-setup.component';
import { LoaderModule } from './Common/Loader';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AddContactDialogComponent } from './Contact/add-contact-dialog/add-contact-dialog.component';
import { FileTableComponent } from './Files/file-table/file-table.component';
import { CdkDetailRowDirective } from './Files/file-table/cdk-detail-row.directive';
import { FileService } from './Files/file.service';
import { AddCommentDialogComponent } from './Files/add-comment-dialog/add-comment-dialog.component';
import { ContactLogInComponent } from './Contact/contact-log-in/contact-log-in.component';
import { FileComponent } from './Files/file/file.component';
import { ContactNavComponent } from './Contact/contact-nav/contact-nav.component';
import { ForgotPasswordComponent } from './Common/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './Common/reset-password/reset-password.component';
import { AdminForgotPasswordComponent } from './Admin/admin-forgot-password/admin-forgot-password.component';
import { AdminResetPasswordComponent } from './Admin/admin-reset-password/admin-reset-password.component';
import { ContactResetPasswordComponent } from './Contact/contact-reset-password/contact-reset-password.component';
import { ContactForgotPasswordComponent } from './Contact/contact-forgot-password/contact-forgot-password.component';
import { MomentModule } from 'ngx-moment';
import { AlwaysAskNotificationsComponent } from './Files/always-ask-notifications/always-ask-notifications.component';
import { AddEntityDialogComponent } from './Entities/add-entity-dialog/add-entity-dialog.component';
import { EntityLoginComponent } from './Entities/entity-login/entity-login.component';
import { EntityComponent } from './Entities/entity/entity.component';
import {AddRequiredDocumentDialogComponent} from './RequiredDocuments/add-required-document-dialog/add-required-document-dialog.component';
import { UploadComponent } from './Uploads/upload/upload.component';
import { NavComponent } from './Common/nav/nav.component';
import {FileUploadModule} from 'ng2-file-upload';




@NgModule({
  declarations: [
    AppComponent,
    AdminLogInComponent,
    AdminHomeComponent,
    AdminNavComponent,
    AddFileComponent,
    AdminSetupComponent,
    AddContactDialogComponent,
    AddEntityDialogComponent,
    FileTableComponent,
    CdkDetailRowDirective,
    AddCommentDialogComponent,
    ContactLogInComponent,
    FileComponent,
    ContactNavComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AdminForgotPasswordComponent,
    AdminResetPasswordComponent,
    ContactResetPasswordComponent,
    ContactForgotPasswordComponent,
    AlwaysAskNotificationsComponent,
    EntityLoginComponent,
    EntityComponent,
    AddRequiredDocumentDialogComponent,
    UploadComponent,
    NavComponent
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
    MatChipsModule,
    MatTableModule,
    MatCardModule,
    MatBadgeModule,
    MomentModule,
    DragDropModule,
    MatTabsModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    LoaderModule,
    FormsModule,
    FileUploadModule,
    MatProgressBarModule
  ],
  providers: [
    AuthService,
    FileService,
    WINDOW_PROVIDERS,
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue:  {duration: 4000}},
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue:  {maxWidth: '400px', minWidth: '60vw'}}

  ],
  bootstrap: [AppComponent],
  entryComponents: [
    AddContactDialogComponent,
    AddCommentDialogComponent,
    AlwaysAskNotificationsComponent,
    AddEntityDialogComponent,
    AddRequiredDocumentDialogComponent
  ]
})
export class AppModule { }
