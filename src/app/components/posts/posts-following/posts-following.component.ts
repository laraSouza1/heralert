import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PostComponent } from '../../shared/post/post.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputIcon } from 'primeng/inputicon';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BlockService } from '../../../services/block/block.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-posts-following',
  imports: [
    CommonModule, FormsModule, IconFieldModule, InputTextModule,
    ButtonModule, InputIcon, PostComponent
  ],
  templateUrl: './posts-following.component.html',
  styleUrl: './posts-following.component.css'
})
export class PostsFollowingComponent implements OnInit {

  posts: any[] = [];
  currentUserId: number = 0;
  searchTerm: string = '';
  isLoading = false;

  constructor(private http: HttpClient, private blockService: BlockService) { }

  ngOnInit(): void {
    //recupera informações do usuário do localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.currentUserId = user.id;
      this.loadFollowingPosts();
    }
  }

  //pesquisa
  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.loadFollowingPosts();
  }

  //fetch de todos os posts de usuários que o user logado segue
  loadFollowingPosts() {
    this.isLoading = true;

    let params = new HttpParams().set('search', this.searchTerm || '');

    this.http.get<any>(`http://localhost:8085/api/posts/following/${this.currentUserId}`, { params })
      .subscribe({
        next: (response) => {
          if (response.status) {
            this.posts = response.data;
          }
        },
        error: (err) => {
          console.error(err);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  //att os bloqueios e recarrega postagens
  onUserBlocked() {
    this.blockService.refreshBlockedUsers(this.currentUserId).then(() => {
      this.loadFollowingPosts();
    });
  }
}
