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
    CreatePostComponent, ButtonModule, ProfileUserComponent, MenubarModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  @ViewChild(CreatePostComponent) createPostComponent!: CreatePostComponent;

  showPostModal: boolean = false;
  items: MenuItem[] | undefined;

  constructor(private router: Router, private messageService: MessageService, private confirmationService: ConfirmationService, private http: HttpClient) { }

  ngOnInit() {
    this.items = [
      { label: 'Minhas postagens', icon: 'pi pi-file' },
      { label: 'Meus favoritos', icon: 'pi pi-heart' },
      { label: 'Meus salvos', icon: 'pi pi-bookmark' },
      { label: 'Meus rascunhos', icon: 'pi pi-pencil' }
    ];
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
        this.showSuccess();
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
