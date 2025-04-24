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
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { HttpClient } from '@angular/common/http';
import { ViewChild } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { UsersComponent } from '../users/users.component';
import { TagsComponent } from '../tags/tags.component';
import { ChangePostsComponent } from '../change-posts/change-posts.component';

interface Comunity {
  name: string;
  code: string;
}

@Component({
  selector: 'app-for-you',
  providers: [MessageService, ConfirmationService],
  imports: [
    LeftSideComponent,
    RightSideComponent,
    ButtonModule,
    IconFieldModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    CreatePostComponent,
    RippleModule,
    CommonModule,
    TooltipModule,
    SelectModule,
    FormsModule,
    UsersComponent,
    TagsComponent,
    ChangePostsComponent
  ],
  templateUrl: './for-you.component.html',
  styleUrls: ['./for-you.component.css']
})

export class ForYouComponent {

  @ViewChild(CreatePostComponent) createPostComponent!: CreatePostComponent;

  showPostModal: boolean = false;
  posts: any[] = [];
  currentUserId: any;
  activeTab: 'fy' | 'following' = 'fy';
  comunities: Comunity[] | undefined;
  selectedComunity: Comunity = { name: 'Postagens', code: 'Postagens' };

  constructor(private router: Router, private messageService: MessageService, private confirmationService: ConfirmationService, private http: HttpClient) { }

  ngOnInit(): void {

    this.comunities = [
      { name: 'Postagens', code: 'Postagens' },
      { name: 'Usuários', code: 'Usuários' },
      { name: 'Tags', code: 'Tags' }
    ];

  }

  postPosted() {
    this.messageService.add({ severity: 'success', summary: 'Postagem feita com sucesso!' });
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

  navigateToAG() {
    this.router.navigate(['/assuntos-gerais']);
  }

  navigateToAF() {
    this.router.navigate(['/autocuidados-femininos']);
  }

  navigateToDA() {
    this.router.navigate(['/dicas-defesa']);
  }

  navigateToRL() {
    this.router.navigate(['/reco-locais']);
  }

  navigateToAIF() {
    this.router.navigate(['/autocuidados-if']);
  }
}
