import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    TableModule, ButtonModule, TagModule, MenuModule,
    ToastModule, NgFor, CommonModule, NgIf
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

  isFavorite: boolean = false;
  likes: number = 0;
  isComment: boolean = false;
  comments: number = 0;
  isSave: boolean = false;
  items: MenuItem[] | undefined;
  isOwnPost: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    this.items = [
      {
        items: [
          { label: 'Bloquear usuário', icon: 'pi pi-user-minus' },
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
    this.router.navigate(['/view-post', this.post.id]);
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
      this.router.navigate(['/profile']);
      //se for o user logado no localstorage, mostra o perfil dele
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
