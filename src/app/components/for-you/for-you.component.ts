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
import { HttpClient } from '@angular/common/http';
import { ViewChild } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';

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
    PostComponent,
    RippleModule,
    CommonModule
  ],
  templateUrl: './for-you.component.html',
  styleUrls: ['./for-you.component.css']
})

export class ForYouComponent {

  @ViewChild(CreatePostComponent) createPostComponent!: CreatePostComponent;

  showPostModal: boolean = false;
  posts: any[] = [];
  currentUserId: any;

  constructor(private router: Router, private messageService: MessageService, private confirmationService: ConfirmationService, private http: HttpClient) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.currentUserId = user.id;
    }
  
    this.http.get<any>('http://localhost:8085/api/posts', {
      params: { userId: this.currentUserId } 
    }).subscribe(response => {
      if (response.status) {
        this.posts = response.data;
      }
    });
  }  
  
  showSuccess() {
    this.messageService.add({ severity: 'success', summary: 'Postagem feita com sucesso!'});
  }

  openCreatePostModal() {
    this.showPostModal = true;

    setTimeout(() => {
      if (this.createPostComponent) {
        this.createPostComponent.title = '';
        this.createPostComponent.tags = [];
        this.createPostComponent.newTag = '';
        this.createPostComponent.selectedComunity = undefined;
        this.createPostComponent.formGroup?.reset();
      }
    });
  }

  closeCreatePostModal() {
    this.showPostModal = false;
  }

  saveDraft() {
    console.log("Rascunho salvo!");
    this.closeCreatePostModal();
  }

  post() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user?.id) {
      alert("Usuário não autenticado!");
      return;
    }

    //Validação form
    if (!this.createPostComponent?.formGroup || this.createPostComponent.formGroup.invalid) {
      this.createPostComponent?.formGroup?.markAllAsTouched();
      return;
    }

    const title = this.createPostComponent.formGroup.get('title')?.value;
    const content = this.createPostComponent.formGroup.get('text')?.value;
    const community = this.createPostComponent.formGroup.get('community')?.value?.code;
    const tags = this.createPostComponent?.tags;

    if (!title || !content || !community) {
      alert("Título, conteúdo e comunidade são obrigatórios!");
      return;
    }

    //Envia os dados para o servidor

    const postData = {
      user_id: user.id,
      title,
      content,
      community,
      tags,
      media_url: null
    };

    this.http.post("http://localhost:8085/api/posts", postData).subscribe({
      next: (response: any) => {
        console.log("Post criado com sucesso:", response);
        this.closeCreatePostModal();
      },
      error: (err) => {
        console.error("Erro ao criar post:", err);
        alert("Erro ao publicar post.");
      }
    });
  }
}
