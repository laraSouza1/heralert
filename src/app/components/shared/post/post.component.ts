import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
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
import { FollowService } from '../../../services/follow/follow.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ReportingPostComponent } from '../../reportingForms/reporting-post/reporting-post.component';
import { MentionPipe } from '../../../pipes/mention/mention.pipe';
import { LinkifyPipe } from '../../../pipes/linkify/linkify.pipe';

@Component({
  selector: 'app-post',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    TableModule, ButtonModule, TagModule, MenuModule, ToastModule, NgFor, CommonModule, NgIf,
    FollowButtonComponent, ConfirmDialogModule, DialogModule, ReportingPostComponent,
    MentionPipe, LinkifyPipe
  ],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit, OnChanges {

  @Input() post: any;
  @Input() tags: string[] = [];
  @Input() userId!: number;
  @Input() isDraft: boolean = false;
  @Input() isProfile: boolean = false;
  @Input() commentsCount: number = 0;

  @Output() editPost = new EventEmitter<any>();
  @Output() deletePost = new EventEmitter<any>();
  @Output() userBlocked = new EventEmitter<void>();

  @ViewChild(ReportingPostComponent) reportingPostComponent!: ReportingPostComponent;

  isFavorite: boolean = false;
  likes: number = 0;
  isComment: boolean = false;
  comments: number = 0;
  isSave: boolean = false;
  items: MenuItem[] | undefined;
  isOwnPost: boolean = false;
  sanitizedContent: SafeHtml | undefined;
  showPostModal: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private blockService: BlockService,
    private followService: FollowService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private clipboard: Clipboard,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.items = [
      {
        label: 'Opções',
        items: [
          {
            label: 'Bloquear usuário',
            icon: 'pi pi-user-minus',
            command: () => this.confirmBlockUser()
          },
          {
            label: 'Denunciar postagem',
            icon: 'pi pi-flag',
            command: () => {
              this.showPostModal = true;
            }
          }
        ]
      }
    ];

    //trás contagem de likes, comentários e verificação de salvo/favorito
    this.likes = this.post.likes_count || 0;
    this.isFavorite = !!this.post.user_liked;
    this.isSave = !!this.post.user_saved;
    this.comments = this.commentsCount !== undefined ? this.commentsCount : (this.post.comments_count || 0);

    //para sanitizar o conteúdo
    if (this.post.content) {
      this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(this.post.content);
    }

    //recupera informações do usuário do localStorage
    if (this.userId) {
      const storedLike = localStorage.getItem(`like_${this.userId}_${this.post.id}`);
      if (storedLike !== null) {
        this.isFavorite = JSON.parse(storedLike);
      }

      //verifica se o usuário atualmente logado é o autor de uma determinada postagem
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

  //para atualização de contagem de comentários
  ngOnChanges(changes: SimpleChanges) {
    if (changes['commentsCount'] && changes['commentsCount'].currentValue !== undefined) {
      this.comments = changes['commentsCount'].currentValue;
    }
  }

  //para navegar ao perfil ao clicar num @ na mensagem
  handleMentionClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('mention')) {
      const mentionedUsername = target.getAttribute('data-username');

      if (!mentionedUsername) {
        return;
      }

      //navega até o perfil do user mencionado
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (mentionedUsername === currentUser.username) {
        this.router.navigate(['/profile']);
        //se for o user logado no localstorage, mostra o perfil dele
      } else {
        this.router.navigate(['/profile-view', mentionedUsername]);
      }
    }
  }

  //para enviar o form de denuncia de post
  submitReportForm() {
    if (this.reportingPostComponent) {
      this.reportingPostComponent.submitReport();

      //atrasar o fechamento do modal por 1.5 segundos
      setTimeout(() => {
        this.showPostModal = false;
      }, 1000);
    }
  }

  //confere validade do form para desativar/ativar btn de envio
  reportFormValid(): boolean {
    return this.reportingPostComponent?.formGroup?.valid ?? false;
  }

  closeReporting() {
    this.showPostModal = false;
    //reseta o form após submissão
    if (this.reportingPostComponent) {
      this.reportingPostComponent.formGroup.reset();
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
      .replace(/(^-|-$)/g, ''); //remove hífens nas pontas
  }

  //para copiar link do post
  copyPostLink(event: MouseEvent) {
    event.stopPropagation();

    const slugTitle = this.slugify(this.post.title);
    const link = `${window.location.origin}/view-post/${this.post.id}-${slugTitle}`;
    this.clipboard.copy(link);
    this.linkCopied();
  }

  linkCopied() {
    this.messageService.add({ severity: 'success', summary: 'Link copiado!' });
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
