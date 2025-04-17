import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CreatePostComponent } from '../shared/create-post/create-post.component';
import { CommonModule, NgFor } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from 'primeng/toast';
import { ProfileUserComponent } from '../profile-user/profile-user.component';
import { LeftSideComponent } from '../shared/left-side/left-side.component';
import { RightSideComponent } from '../shared/right-side/right-side.component';
import { ProfileUserViewComponent } from '../profile-user-view/profile-user-view.component';
import { PostComponent } from '../shared/post/post.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-profile-view',
  providers: [MessageService, ConfirmationService],
  imports: [RightSideComponent,
    LeftSideComponent,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    CreatePostComponent,
    ButtonModule,
    MenubarModule,
    CommonModule,
    ProfileUserViewComponent,
  CommonModule,
PostComponent,
IconFieldModule,
InputIconModule,
InputTextModule],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.css'
})
export class ProfileViewComponent implements OnInit {

  @ViewChild(CreatePostComponent) createPostComponent!: CreatePostComponent;

  showCreatePostModal: boolean = false;
  user: any;
  userPosts: any[] = [];

  constructor(private messageService: MessageService, private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const userId = params.get('id');
      if (userId) {
        this.loadUser(userId);
        this.loadUserPosts(userId);
      }
    });
  }

  loadUser(id: string): void {
    this.http.get<any>(`http://localhost:8085/api/users/${id}`).subscribe({
      next: (res) => {
        if (res.status) {
          this.user = res.data;

          const date = new Date(this.user.created_at);
          const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          this.user.memberSince = `Membro desde ${meses[date.getMonth()]} ${date.getFullYear()}`;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar perfil:', err);
      }
    });
  }

  loadUserPosts(userId: string): void {
    this.http.get<any>(`http://localhost:8085/api/posts/user/${userId}`).subscribe({
      next: (res) => {
        if (res.status) {
          this.userPosts = res.data;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar posts do usuário:', err);
      }
    });
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
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      error: (err) => {
        console.error("Erro ao criar post:", err);
        alert("Erro ao publicar post.");
      }
    });
  }

}
