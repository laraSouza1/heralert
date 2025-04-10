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

@Component({
  selector: 'app-profile',
  providers: [MessageService, ConfirmationService],
  imports: [RightSideComponent, LeftSideComponent, DialogModule,
    ConfirmDialogModule,
    ToastModule,
    CreatePostComponent,
    PostComponent, ButtonModule, ProfileUserComponent, MenubarModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  @ViewChild(CreatePostComponent) createPostComponent!: CreatePostComponent;

  showPostModal: boolean = false;
  activeTab: 'posts' | 'favorites' | 'saved' = 'posts';
  items: MenuItem[] | undefined;

  posts = [
    { id: 1, userId: 1, username: 'Usuário', content: 'Meu post...', createdAt: 'Hoje', likes: 10, comments: 5, favorites: 3 }
  ];

  favoritePosts = [
    { id: 2, userId: 2, username: 'Outro Usuário', content: 'Post favoritado...', createdAt: 'Ontem', likes: 15, comments: 8, favorites: 5 }
  ];

  savedPosts = [
    { id: 3, userId: 3, username: 'Usuário Salvo', content: 'Post salvo...', createdAt: 'Semana passada', likes: 20, comments: 12, favorites: 8 }
  ];

  constructor(private router: Router, private messageService: MessageService, private confirmationService: ConfirmationService, private http: HttpClient) { }

  ngOnInit() {
    this.items = [
      { label: 'Minhas postagens', icon: 'pi pi-file', command: () => this.activeTab = 'posts' },
      { label: 'Meus favoritos', icon: 'pi pi-heart', command: () => this.activeTab = 'favorites' },
      { label: 'Meus salvos', icon: 'pi pi-bookmark', command: () => this.activeTab = 'saved' }
    ];
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

  showSuccess() {
    this.messageService.add({ severity: 'info', summary: 'POstado com sucesso!', life: 3000 });
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
