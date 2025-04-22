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
import { LeftSideComponent } from '../../shared/left-side/left-side.component';
import { RightSideComponent } from '../../shared/right-side/right-side.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { PostComponent } from '../../shared/post/post.component';
import { InputIcon } from 'primeng/inputicon';

@Component({
  selector: 'app-autocuidados-femininos',
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
    PostComponent,
    InputIcon
  ],
  templateUrl: './autocuidados-femininos.component.html',
  styleUrl: './autocuidados-femininos.component.css'
})
export class AutocuidadosFemininosComponent {

  @ViewChild(CreatePostComponent) createPostComponent!: CreatePostComponent;

  showPostModal: boolean = false;
  posts: any[] = [];
  currentUserId: number = 0;
  searchTerm = '';
  community = 'Autocuidados Gerais';

  constructor(private messageService: MessageService, private http: HttpClient) { }


  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.currentUserId = user.id;
      this.loadPosts();
    }
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.loadPosts();
  }

  loadPosts() {
    this.http.get<any>(`http://localhost:8085/api/posts`, {
      params: {
        userId: this.currentUserId.toString(),
        community: this.community,
        search: this.searchTerm
      }
    }).subscribe(response => {
      if (response.status) {
        this.posts = response.data;
      }
    });
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
    console.log("Rascunho salvo!");
    this.closeCreatePostModal();
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
      media_url: null
    };

    this.http.post("http://localhost:8085/api/posts", postData).subscribe({
      next: (response: any) => {
        console.log("Post criado com sucesso:", response);
        this.closeCreatePostModal();
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
