import { Component, OnInit, ViewChild } from '@angular/core';
import { PostComponent } from '../../shared/post/post.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { CommonModule, NgIf } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { MentionPipe } from '../../../pipes/mention/mention.pipe';
import { ReportingCommentComponent } from '../../reportingForms/reporting-comment/reporting-comment.component';
import { TooltipModule } from 'primeng/tooltip';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-view-post',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    PostComponent, CommonModule, IconFieldModule, InputIconModule,
    InputTextModule, ButtonModule, ToastModule, NgIf, MenuModule, FormsModule, InputText, DialogModule,
    ConfirmDialogModule, MentionPipe, ReportingCommentComponent, TooltipModule
  ],
  templateUrl: './view-post.component.html',
  styleUrl: './view-post.component.css'
})
export class ViewPostComponent implements OnInit {

  items: MenuItem[] | undefined;
  post: any;
  tags: string[] = [];
  comments: any[] = [];
  currentUserId: any;
  newComment = '';
  newCommentMap: { [key: number]: string } = {};
  replyToCommentId: number | null = null;
  replyToUsername: string = '';
  commentTree: any[] = [];
  isOwnPost: boolean = false;
  showCommentReportModal: boolean = false;
  selectedCommentToReport: any = null;

  @ViewChild(ReportingCommentComponent) reportingCommentComponent!: ReportingCommentComponent;

  @Output() commentsUpdated = new EventEmitter<number>();

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = user?.id;

    const idSlug = this.route.snapshot.paramMap.get('idSlug'); //pega o id + slug
    const postId = idSlug?.split('-')[0];

    if (postId) {
      this.http.get<any>(`http://localhost:8085/api/posts/${postId}`, {
        params: { userId: this.currentUserId }
      }).subscribe(response => {
        if (response.status) {
          this.post = response.data;
          this.tags = this.post.tags;
          this.comments = this.post.comments;
          this.buildCommentTree();
          this.commentsUpdated.emit(this.comments.length);
        }
      });
    }

    //itens menu
    this.items = [
      {
        label: 'Denunciar comentário',
        icon: 'pi pi-flag',
        command: (event) => {
          this.openReportingCommentModal();
        }

      }
    ];
  }

  //para abrir o menu dos 3 pontinhos com a opção de report
  openReportCommentMenu(event: Event, comment: any, menu: any) {
    this.selectedCommentToReport = comment;
    menu.toggle(event);
  }

  //abre modal de denuncia de comentário
  openReportingCommentModal() {
    this.showCommentReportModal = true;
  }

  closeReportingCommentModal() {
    this.showCommentReportModal = false;
    //reseta o form após submissão
    if (this.reportingCommentComponent) {
      this.reportingCommentComponent.formGroup.reset();
      this.reportingCommentComponent.showOtherReasonTextarea = false;
    }
  }

  //para enviar o form de denuncia de post
  submitCommentReportForm() {
    if (this.reportingCommentComponent) {
      this.reportingCommentComponent.submitReport();
      //atrasar o fechamento do modal por 1.5 segundos
      setTimeout(() => {
        this.closeReportingCommentModal();
      }, 1000); //fecha modal após envio
    }
  }

  //confere validade do form para desativar/ativar btn de envio
  isCommentReportFormValid(): boolean {
    return this.reportingCommentComponent?.formGroup?.valid ?? false;
  }

  //ver perfil user selecionado
  goToUserProfile(userId: number, username: string): void {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser && currentUser.id === userId) {
      this.router.navigate(['/profile']);
      //se for o user logado no localstorage, mostra o perfil dele
    } else {
      this.router.navigate(['/profile-view', username]);
    }
  }

  //marcação de user por @ pipe mention
  handleMentionClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('mention')) {
      const mentionedUsername = target.getAttribute('data-username');

      if (!mentionedUsername) {
        console.error('Username não encontrado no elemento clicado.');
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

  //adicionar um novo comentário
  addComment() {
    const content = this.replyToCommentId
      ? this.newCommentMap[this.replyToCommentId]?.trim()
      : this.newComment.trim();
    if (!content) return;

    //envia conteudo pro back
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const commentData: any = {
      user_id: user.id,
      post_id: this.post.id,
      content,
      parent_id: this.replyToCommentId || null
    };

    this.http.post('http://localhost:8085/api/comments', commentData).subscribe((response: any) => {
      if (response.status) {
        const newComment = response.data;
        this.comments.push(newComment);
        this.buildCommentTree();

        if (this.replyToCommentId) {
          this.newCommentMap[this.replyToCommentId] = '';
        } else {
          this.newComment = '';
        }

        this.replyToCommentId = null;
        this.replyToUsername = '';

        this.commentsUpdated.emit(this.comments.length); //emite a contagem atualizada após criação de comentário
      }
    });
  }

  //constrói hierarquia de comentários
  buildCommentTree() {
    const map: { [key: number]: any } = {};
    const roots: any[] = [];

    this.comments.forEach(comment => {
      comment.children = [];
      map[comment.id] = comment;
    });

    this.comments.forEach(comment => {
      if (!comment.parent_id) {
        roots.push(comment);
      } else {
        const parent = map[comment.parent_id];

        const rootParent = parent?.parent_id ? map[parent.parent_id] : parent;

        if (rootParent) {
          rootParent.children.push(comment);
        } else {
          roots.push(comment);
        }
      }
    });

    //ordenar comentários principais e respostas por data
    const sortComments = (list: any[]) => {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    };

    sortComments(roots);
    roots.forEach(root => sortComments(root.children));

    this.commentTree = roots;
  }

  //pega os dados para criar uma resposta + o user de quem está respondendo
  startReply(comment: any) {
    this.replyToCommentId = comment.id;
    this.replyToUsername = comment.username;
    this.newCommentMap[comment.id] = `@${comment.username} `;
  }

  //modal para confirmação de deletar comentário
  confirmDeleteComment(commentId: number) {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este comentário?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'my-delete-button',
      rejectButtonStyleClass: 'my-cancel-button',
      accept: () => {
        this.http.delete(`http://localhost:8085/api/comments/${commentId}`).subscribe({
          next: () => {
            const deletedParentComment = this.comments.find(c => c.id === commentId);
            const idsToDelete: number[] = [commentId];

            if (deletedParentComment) {
              const collectChildIds = (comment: any) => {
                if (comment.children) {
                  comment.children.forEach((child: any) => {
                    idsToDelete.push(child.id);
                    collectChildIds(child);
                  });
                }
              };

              this.fetchCommentsForPost();
            } else {
              this.comments = this.comments.filter(c => c.id !== commentId);
              this.buildCommentTree();
            }

            this.commentsUpdated.emit(this.comments.length); //emite a contagem atualizada após exclusão de comentário
            this.messageService.add({ severity: 'success', summary: 'Comentário excluído!' });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Erro ao excluir comentário' });
          }
        });
      }
    });
  }

  //busca os comentários do post
  fetchCommentsForPost() {
    const postId = this.route.snapshot.paramMap.get('idSlug')?.split('-')[0];
    if (postId) {
      this.http.get<any>(`http://localhost:8085/api/posts/${postId}`, {
        params: { userId: this.currentUserId }
      }).subscribe(response => {
        if (response.status) {
          this.comments = response.data.comments;
          this.buildCommentTree(); //reconstói a arvore
          this.commentsUpdated.emit(this.comments.length); //emite a contagem de4 comentários atualizada
        }
      });
    }
  }

}
