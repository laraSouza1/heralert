import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { CreatePostComponent } from '../../../shared/create-post/create-post.component';
import { ButtonModule } from 'primeng/button';
import { ProfileUserComponent } from '../profile-user/profile-user.component';
import { MenubarModule } from 'primeng/menubar';
import { CommonModule } from '@angular/common';
import { ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PostsDraftsComponent } from '../../../posts/posts-drafts/posts-drafts.component';
import { PostsLikedComponent } from '../../../posts/posts-liked/posts-liked.component';
import { PostsUserComponent } from '../../../posts/posts-user/posts-user.component';
import { PostsSavedComponent } from '../../../posts/posts-saved/posts-saved.component';
import { FollowingUserComponent } from '../../../followers/following-user/following-user.component';
import { FollowersUserComponent } from '../../../followers/followers-user/followers-user.component';

@Component({
  selector: 'app-profile',
  providers: [MessageService, ConfirmationService],
  imports: [
    DialogModule, ConfirmDialogModule, ToastModule, CreatePostComponent,
    ButtonModule, ProfileUserComponent, MenubarModule, CommonModule, PostsDraftsComponent, PostsLikedComponent,
    PostsUserComponent, PostsSavedComponent, FollowingUserComponent, FollowersUserComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  @ViewChild(CreatePostComponent) createPostComponent!: CreatePostComponent;
  @ViewChild(FollowingUserComponent) followingUserComponent?: FollowingUserComponent;
  @ViewChild(FollowersUserComponent) followersUserComponent?: FollowersUserComponent;
  @ViewChild('profileUser') profileUserComponent!: ProfileUserComponent;

  showCreatePostModal: boolean = false;
  activeTab: 'mp' | 'mf' | 'ms' | 'mr' = 'mp';
  postToEdit: any = null;
  showFollowingModal = false;
  showFollowersModal = false;
  resetFollowingComponent = false;
  resetFollowersComponent = false;

  constructor(
    private messageService: MessageService,
    private http: HttpClient,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {

    //vai salvar a tab atual para não sair dela quando dar reload na página
    const savedTab = localStorage.getItem('activeTab') as 'mp' | 'mf' | 'ms' | 'mr' | null;
    if (savedTab && ['mp', 'mf', 'ms', 'mr'].includes(savedTab)) {
      this.activeTab = savedTab;
    }
  }

  //tabs de conteudo
  setActiveTab(tab: 'mp' | 'mf' | 'ms' | 'mr'): void {
    this.activeTab = tab;
    localStorage.setItem('activeTab', tab);
  }

  //referente a abrir/fechar modais de seguindo/seguidores
  onCloseFollowingModal() {
    this.resetFollowingComponent = true;

    //atualiza numeros e lista
    setTimeout(() => {
      this.resetFollowingComponent = false;
      this.profileUserComponent.loadCounts();
    });
  }

  onCloseFollowersModal() {
    this.resetFollowersComponent = true;

    setTimeout(() => {
      this.resetFollowersComponent = false;
      this.profileUserComponent.loadCounts();
    });
  }

  onOpenFollowingModal() {
    this.showFollowingModal = true;
    this.profileUserComponent.loadCounts();

    setTimeout(() => this.followingUserComponent?.loadUsers(), 0);
  }

  onOpenFollowersModal() {
    this.showFollowersModal = true;
    this.profileUserComponent.loadCounts();

    setTimeout(() => this.followersUserComponent?.loadUsers(), 0);
  }

  //referente a abrir/fechar modal de criação de post
  openCreatePostModal() {
    this.showCreatePostModal = true;

    setTimeout(() => {
      if (this.createPostComponent) {
        if (this.postToEdit) {
          this.createPostComponent.setEditPost(this.postToEdit);
        } else {
          this.createPostComponent.resetForm();
        }
      }
    });
  }

  closeCreatePostModal() {
    this.showCreatePostModal = false;
  }

  //referente a edição e modal de deletePost
  handleEditPost(post: any) {
    this.postToEdit = post;
    this.openCreatePostModal();
  }

  handleDeletePost(post: any) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a postagem "${post.title}"?`,
      header: 'Excluir postagem',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'my-delete-button',
      rejectButtonStyleClass: 'my-cancel-button',
      accept: () => {
        this.http.delete(`http://localhost:8085/api/posts/${post.id}`).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Post deletado com sucesso!' });
            setTimeout(() => window.location.reload(), 1000);
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Erro ao deletar post.' });
          }
        });
      }
    });
  }


  //referente a salvar um rascunho e criar post

  saveDraft() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.id) {
      alert("Usuário não autenticado!");
      return;
    }

    if (!this.createPostComponent?.formGroup) return;

    const title = this.createPostComponent.formGroup.get('title')?.value || 'Rascunho sem título';
    const content = this.createPostComponent.formGroup.get('text')?.value || '';
    const community = this.createPostComponent.formGroup.get('community')?.value?.code || null;
    const tags = this.createPostComponent?.tags || [];

    const postData = {
      user_id: user.id,
      title,
      content,
      community,
      tags,
      media_url: null,
      is_draft: 1
    };

    if (this.createPostComponent.editMode && this.createPostComponent.editingPostId) {
      //torna post postado em rascunho
      this.http.put(`http://localhost:8085/api/posts/${this.createPostComponent.editingPostId}`, postData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'info', summary: 'Rascunho atualizado com sucesso' });
          this.closeCreatePostModal();
          setTimeout(() => window.location.reload(), 1000);
        },
        error: () => alert("Erro ao atualizar o rascunho.")
      });
    } else {
      //cria novo rascunho
      this.http.post("http://localhost:8085/api/posts", postData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'info', summary: 'Rascunho salvo com sucesso' });
          this.closeCreatePostModal();
          setTimeout(() => window.location.reload(), 1000);
        },
        error: () => alert("Erro ao salvar rascunho.")
      });
    }
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
      media_url: null,
      is_draft: 0
    };

    if (this.createPostComponent.editMode && this.createPostComponent.editingPostId) {
      this.http.put(`http://localhost:8085/api/posts/${this.createPostComponent.editingPostId}`, postData).subscribe({
        next: () => {
          this.closeCreatePostModal();
          setTimeout(() => window.location.reload(), 1000);
        },
        error: () => alert("Erro ao atualizar o post.")
      });
    } else {
      this.http.post("http://localhost:8085/api/posts", postData).subscribe({
        next: () => {
          this.closeCreatePostModal();
          setTimeout(() => window.location.reload(), 1000);
        },
        error: () => alert("Erro ao publicar post.")
      });
    }
  }

  postPosted() {
    this.messageService.add({ severity: 'success', summary: 'Postagem feita com sucesso!' });
  }
}
