import { Component } from '@angular/core';
import { LeftSideComponent } from '../shared/left-side/left-side.component';
import { RightSideComponent } from '../shared/right-side/right-side.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { CreatePostComponent } from '../shared/create-post/create-post.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { PostComponent } from '../shared/post/post.component';

@Component({
  selector: 'app-for-you',
  providers: [MessageService, ConfirmationService],
  imports: [
    LeftSideComponent,
    RightSideComponent,
    ButtonModule,
    InputIcon,
    IconFieldModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    CreatePostComponent,
    PostComponent
  ],
  templateUrl: './for-you.component.html',
  styleUrls: ['./for-you.component.css']
})

export class ForYouComponent {
  showPostModal: boolean = false;

  constructor(private router: Router, private messageService: MessageService, private confirmationService: ConfirmationService) {}

  openCreatePostModal() {
    this.showPostModal = true;
  }

  closeCreatePostModal() {
    this.showPostModal = false;
  }

  saveDraft() {
    console.log("Rascunho salvo!");
    this.closeCreatePostModal();
  }

  post() {
    console.log("Post publicado!");
    this.closeCreatePostModal();
  }
}