import { Component } from '@angular/core';
import { LeftSideComponent } from '../shared/left-side/left-side.component';
import { RightSideComponent } from '../shared/right-side/right-side.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Router, RouterOutlet } from '@angular/router';
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
import { AutocuidadosFemininosComponent } from '../communities/autocuidados-femininos/autocuidados-femininos.component';
import { AutocuidadosIFComponent } from '../communities/autocuidados-if/autocuidados-if.component';
import { DicasDefesaComponent } from '../communities/dicas-defesa/dicas-defesa.component';
import { AssuntosGeraisComponent } from '../communities/assuntos-gerais/assuntos-gerais.component';
import { RecoLocaisComponent } from '../communities/reco-locais/reco-locais.component';

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
