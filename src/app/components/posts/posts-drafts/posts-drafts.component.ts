import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PostComponent } from '../../shared/post/post.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-posts-drafts',
  imports: [
    CommonModule, FormsModule, PostComponent, IconFieldModule,
    InputTextModule, ButtonModule, InputIcon
  ],
  templateUrl: './posts-drafts.component.html',
  styleUrl: './posts-drafts.component.css'
})
export class PostsDraftsComponent implements OnInit {

  @Output() editPostFromUser = new EventEmitter<any>();
  @Output() deletePostFromUser = new EventEmitter<any>();

  userPosts: any[] = [];
  currentUserId: number = 0;
  searchTerm = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {

    //recupera informações do usuário do localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.currentUserId = user.id;
      this.loadDraftPosts();
    }
  }

  //emiters das funções para editar/deletar post que está em post.component
  onEditPost(post: any) {
    this.editPostFromUser.emit(post);
  }

  onDeletePost(post: any) {
    this.deletePostFromUser.emit(post);
  }

  //pesquisa
  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.loadDraftPosts();
  }

  //fetch nos posts que são rascunhos (is_draft = 1)
  loadDraftPosts() {
    this.http.get<any>(`http://localhost:8085/api/posts/user/${this.currentUserId}/drafts`, {
      params: { search: this.searchTerm }
    }).subscribe(response => {
      if (response.status) {
        this.userPosts = response.data;
      }
    });
  }
}
