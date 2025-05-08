import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FollowButtonComponent } from '../follow-button/follow-button.component';
import { BlockService } from '../../../services/block/block.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { FollowService } from '../../../services/services/follow.service';

@Component({
  selector: 'app-post',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    TableModule, ButtonModule, TagModule, MenuModule,
    ToastModule, NgFor, CommonModule, NgIf, FollowButtonComponent, ConfirmDialogModule, DialogModule
  ],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  @Input() post: any;
  @Input() tags: string[] = [];
  @Input() userId!: number;
  @Input() isDraft: boolean = false;
  @Input() isProfile: boolean = false;

  @Output() editPost = new EventEmitter<any>();
  @Output() deletePost = new EventEmitter<any>();
  @Output() userBlocked = new EventEmitter<void>();

  isFavorite: boolean = false;
  likes: number = 0;
  isComment: boolean = false;
  comments: number = 0;
  isSave: boolean = false;
  items: MenuItem[] | undefined;
  isOwnPost: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private blockService: BlockService,
    private followService: FollowService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.items = [
      {
        items: [
          {
            label: 'Bloquear usuário',
            icon: 'pi pi-user-minus',
            command: () => this.confirmBlockUser()
          },
          { label: 'Denunciar postagem', icon: 'pi pi-flag' }
        ]
      }
    ];

    //trás contagem de likes, comentários e verificação de salvo/favorito
    this.likes = this.post.likes_count || 0;
    this.isFavorite = !!this.post.user_liked;
    this.isSave = !!this.post.user_saved;
    this.comments = this.post.comments_count || 0;

    //recupera informações do usuário do localStorage
    if (this.userId) {
      const storedLike = localStorage.getItem(`like_${this.userId}_${this.post.id}`);
      if (storedLike !== null) {
        this.isFavorite = JSON.parse(storedLike);
      }

      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        this.isOwnPost = user.id === this.post.user_id;
      }

      const storedSave = localStorage.getItem(`save_${this.userId}_${this.post.id}`);
      if (storedSave !== null) {
        this.isSave = JSON.parse(storedSave);
      }
    }
  }

  //dialogo de confirmação para bloquear
  confirmBlockUser() {
    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
    const targetUserId = this.post.user_id;

    if (!currentUserId || !targetUserId || currentUserId === targetUserId) return;

    const username = this.post.username || 'usuário';

    this.confirmationService.confirm({
      message: `Deseja bloquear @${username}?`,
      header: 'Confirmar Bloqueio',
      icon: 'pi pi-exclamation-circle',
      acceptLabel: 'Bloquear',
      rejectLabel: 'Cancelar',
      //style dos btns
      acceptButtonStyleClass: 'my-block-button',
      rejectButtonStyleClass: 'my-cancel-button',
      accept: () => {
        this.blockService.blockUser(currentUserId, targetUserId).subscribe(() => {
          this.unfollowIfFollowing(currentUserId, targetUserId);
          this.blockService.clear();
          this.userBlocked.emit();
        });
      }
    });
  }

  //para de seguir após bloquear
  unfollowIfFollowing(currentUserId: number, targetUserId: number) {
    //verifica se segue
    this.http.get<any>('http://localhost:8085/api/follows/check', {
      params: {
        follower_id: currentUserId,
        following_id: targetUserId
      }
    }).subscribe(res => {
      if (res.status && res.following) {
        //para de seguir
        this.http.delete('http://localhost:8085/api/follows', {
          params: {
            follower_id: currentUserId,
            following_id: targetUserId
          }
        }).subscribe(() => {
          this.followService.clearFollowings();
          this.followService.refreshFollowings(currentUserId);
          this.followService.getFollowerCountChanged();
        });
      }
    });
  }

  //vai abrir para edição de post
  onEditClick() {
    this.editPost.emit(this.post);
  }

  //vai abrir para deletar post
  onDeleteClick() {
    this.deletePost.emit(this.post);
  }

  //abre post clicado
  goToPostDetail(event: MouseEvent) {
    event.stopPropagation();
    const slugTitle = this.slugify(this.post.title);
    this.router.navigate([`/view-post/${this.post.id}-${slugTitle}`]);
  }

  //para link do post
  slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') //remove acentos
      .replace(/[^a-z0-9]+/g, '-') //substitui por hífen
      .replace(/(^-|-$)/g, '');//remove hífens nas pontas
  }

  //encaminha para comunidade
  goToCommunity(communityName: string, event: MouseEvent): void {
    event.stopPropagation();
    const routeMap: { [key: string]: string } = {
      'Recomendações de Locais': 'reco-locais',
      'Autocuidados Gerais': 'autocuidados-femininos',
      'Autocuidados Íntimos Femininos': 'autocuidados-if',
      'Dicas de Autodefesa': 'dicas-defesa',
      'Assuntos Gerais': 'assuntos-gerais',
    };
    const route = routeMap[communityName];
    if (route) {
      this.router.navigate(['/' + route]);
    }
  }

  //encaminha para tag clicada
  goToTag(tag: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/post-tag'], { queryParams: { tag } });
  }

  //ver perfil user selecionado
  goToUserProfile(): void {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser && currentUser.id === this.post.user_id) {
      this.router.navigate(['/profile']); //se for o user logado no localstorage, mostra o perfil dele
    } else {
      this.router.navigate(['/profile-view', this.post.username]);
    }
  }

  //função para favoritra
  toggleFavorite() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.id) {
      alert("Usuário não autenticado!");
      return;
    }

    if (user.id === this.post.user_id) {
      alert("Você não pode curtir sua própria publicação.");
      return;
    }

    const prevIsFavorite = this.isFavorite;
    this.isFavorite = !this.isFavorite;

    const apiUrl = this.isFavorite
      ? `http://localhost:8085/api/likes`
      : `http://localhost:8085/api/likes/${user.id}/${this.post.id}`;

    const request = this.isFavorite
      ? this.http.post(apiUrl, { user_id: user.id, post_id: this.post.id })
      : this.http.delete(apiUrl);

    request.subscribe({
      next: () => {
        const action = this.isFavorite ? 'liked' : 'unliked';

        this.likes += this.isFavorite ? 1 : -1;

        localStorage.setItem(`like_${user.id}_${this.post.id}`, JSON.stringify(this.isFavorite));
      },
      error: (err) => {
        console.error(`Erro ao ${this.isFavorite ? 'dar like' : 'remover like'}:`, err);
        alert(`Erro ao ${this.isFavorite ? 'dar like' : 'remover like'}.`);
        this.isFavorite = prevIsFavorite;
        this.likes += this.isFavorite ? -1 : 1;
      }
    });
  }

  //função para salvar
  toggleSave() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.id) {
      alert("Usuário não autenticado!");
      return;
    }

    if (user.id === this.post.user_id) {
      alert("Você não pode salvar sua própria postagem.");
      return;
    }

    const prevIsSave = this.isSave;
    this.isSave = !this.isSave;

    const apiUrl = this.isSave
      ? `http://localhost:8085/api/saved_posts`
      : `http://localhost:8085/api/saved_posts/${user.id}/${this.post.id}`;

    const request = this.isSave
      ? this.http.post(apiUrl, { user_id: user.id, post_id: this.post.id })
      : this.http.delete(apiUrl);

    request.subscribe({
      next: () => {
        localStorage.setItem(`save_${user.id}_${this.post.id}`, JSON.stringify(this.isSave));
      },
      error: (err) => {
        console.error(`Erro ao ${this.isSave ? 'salvar' : 'remover'} a postagem:`, err);
        alert(`Erro ao ${this.isSave ? 'salvar' : 'remover'} a postagem.`);
        this.isSave = prevIsSave;
      }
    });
  }
}
