import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CreatePostComponent } from '../../shared/create-post/create-post.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { PostComponent } from '../../shared/post/post.component';
import { InputIcon } from 'primeng/inputicon';
import { BlockService } from '../../../services/block/block.service';

@Component({
  selector: 'app-reco-locais',
  providers: [MessageService, ConfirmationService],
  imports: [
    ButtonModule, IconFieldModule, InputTextModule,
    DialogModule, ConfirmDialogModule, ToastModule, CreatePostComponent, RippleModule,
    CommonModule, TooltipModule, SelectModule, FormsModule, PostComponent, InputIcon
  ],
  templateUrl: './reco-locais.component.html',
  styleUrl: './reco-locais.component.css'
})
export class RecoLocaisComponent {

  @ViewChild(CreatePostComponent) createPostComponent!: CreatePostComponent;

  showPostModal: boolean = false;
  posts: any[] = [];
  currentUserId: number = 0;
  searchTerm = '';
  community = 'Recomendações de Locais';

  constructor(
    private messageService: MessageService,
    private http: HttpClient,
    private blockService: BlockService
  ) { }

  ngOnInit() {
    //busca dados do user logado no localstorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.currentUserId = user.id;
      //atualiza users bloqueados para n exibir os posts deles
      this.blockService.refreshBlockedUsers(this.currentUserId).then(() => {
        this.loadPosts();
      });
    }
  }

  //pesquisa
  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.loadPosts();
  }

  //fetch posts
  loadPosts() {

    this.blockService.refreshBlockedUsers(this.currentUserId).then(() => {
      const blockedUsers = this.blockService['blockedUsers'];
      const usersWhoBlockedMe = this.blockService['usersWhoBlockedMe'];

      this.http.get<any>(`http://localhost:8085/api/posts`, {
        params: {
          userId: this.currentUserId.toString(),
          community: this.community,
          search: this.searchTerm
        }
      }).subscribe(response => {
        if (response.status) {
          //se houver user bloqueado, não mostra os posts dele
          this.posts = response.data.filter((post: any) =>
            !blockedUsers.has(post.user_id) && !usersWhoBlockedMe.has(post.user_id)
          );
        }
      });
    });
  }

  //att os bloqueios e recarrega postagens
  onUserBlocked() {
    this.blockService.refreshBlockedUsers(this.currentUserId).then(() => {
      this.loadPosts();
    });
  }

  //para abrir/fechar modal de criação de post --------
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

  //salvar rascunho
  saveDraft() {
    //busca dados do user logado no localstorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.id) {
      alert("Usuário não autenticado");
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
        },
        error: () => alert("Erro ao salvar rascunho.")
      });
    }
  }

  //criação de novo post
  createPost() {
    //busca dados do user logado no localstorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user?.id) {
      alert("Usuário não autenticado!");
      return;
    }

    //aalidação form
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

    //envia os dados para o servidor

    const postData = {
      user_id: user.id,
      title,
      content,
      community,
      tags,
      media_url: null,
      is_draft: 0
    };

    //para atualização de post
    if (this.createPostComponent.editMode && this.createPostComponent.editingPostId) {
      this.http.put(`http://localhost:8085/api/posts/${this.createPostComponent.editingPostId}`, postData).subscribe({
        next: () => {
          this.closeCreatePostModal();
          setTimeout(() => window.location.reload(), 1000);
        },
        error: () => alert("Erro ao atualizar o post.")
      });
      //para criação de post
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

  //mensagem de post feito
  postPosted() {
    this.messageService.add({ severity: 'success', summary: 'Postagem feita com sucesso!' });
  }
}
