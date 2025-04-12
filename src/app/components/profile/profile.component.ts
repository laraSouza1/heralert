import { Component } from '@angular/core';
import { RightSideComponent } from '../shared/right-side/right-side.component';
import { LeftSideComponent } from '../shared/left-side/left-side.component';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { CreatePostComponent } from '../shared/create-post/create-post.component';
import { PostComponent } from '../shared/post/post.component';
import { ButtonModule } from 'primeng/button';
import { ProfileUserComponent } from '../profile-user/profile-user.component';
import { MenubarModule } from 'primeng/menubar';
import { CommonModule } from '@angular/common';
import { ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PostsDraftsComponent } from '../posts/posts-drafts/posts-drafts.component';
import { PostsLikedComponent } from '../posts/posts-liked/posts-liked.component';
import { PostsUserComponent } from '../posts/posts-user/posts-user.component';
import { PostsSavedComponent } from '../posts/posts-saved/posts-saved.component';

@Component({
  selector: 'app-profile',
  providers: [MessageService, ConfirmationService],
  imports: [RightSideComponent,
    LeftSideComponent,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    CreatePostComponent,
    ButtonModule,
    ProfileUserComponent,
    MenubarModule,
    CommonModule,
    PostsDraftsComponent,
    PostsLikedComponent,
    PostsUserComponent,
    PostsSavedComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  @ViewChild(CreatePostComponent) createPostComponent!: CreatePostComponent;

  showCreatePostModal: boolean = false;
  activeTab: 'mp' | 'mf' | 'ms' | 'mr' = 'mp';

  constructor(private messageService: MessageService, private http: HttpClient) { }

  ngOnInit() {
    const savedTab = localStorage.getItem('activeTab') as 'mp' | 'mf' | 'ms' | 'mr' | null;
    if (savedTab && ['mp', 'mf', 'ms', 'mr'].includes(savedTab)) {
      this.activeTab = savedTab;
    }
  }

  setActiveTab(tab: 'mp' | 'mf' | 'ms' | 'mr'): void {
    this.activeTab = tab;
    localStorage.setItem('activeTab', tab);
  }

  postPosted() {
    this.messageService.add({ severity: 'success', summary: 'Postagem feita com sucesso!' });
  }

  openCreatePostModal() {
    this.showCreatePostModal = true;

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
    this.showCreatePostModal = false;
  }

  saveDraft() {
    console.log("Rascunho salvo!");
    this.closeCreatePostModal();
  }

  createPost() {
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
        this.postPosted();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      },
      error: (err) => {
        console.error("Erro ao criar post:", err);
        alert("Erro ao publicar post.");
      }
    });
  }
}
