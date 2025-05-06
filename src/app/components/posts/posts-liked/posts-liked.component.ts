import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PostComponent } from '../../shared/post/post.component';
import { HttpClient } from '@angular/common/http';
import { BlockService } from '../../../services/block/block.service';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-posts-liked',
  imports: [
    CommonModule, FormsModule, PostComponent, IconFieldModule,
    InputTextModule, ButtonModule, InputIcon, ConfirmDialogModule
  ],
  templateUrl: './posts-liked.component.html',
  styleUrl: './posts-liked.component.css'
})
export class PostsLikedComponent implements OnInit {

  likedPosts: any[] = [];
  currentUserId: number = 0;
  searchTerm = '';

  constructor(private http: HttpClient, private blockService: BlockService) { }

  ngOnInit() {

    //recupera informações do usuário do localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.currentUserId = user.id;
      this.blockService.refreshBlockedUsers(this.currentUserId).then(() => {
        this.loadLikedPosts();
      });
    }
  }

  //pesquisa
  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.loadLikedPosts();
  }

  //fetch posts curtidos pelo user
  loadLikedPosts() {
    this.blockService.refreshBlockedUsers(this.currentUserId).then(() => {
      const blockedUsers = this.blockService['blockedUsers'];
      const usersWhoBlockedMe = this.blockService['usersWhoBlockedMe'];

      this.http.get<any>(`http://localhost:8085/api/posts/liked/${this.currentUserId}`, {
        params: { search: this.searchTerm }
      }).subscribe(response => {
        if (response.status) {
          //se houver user bloqueado, não mostra os posts curtidos dele
          this.likedPosts = response.data.filter((post: any) =>
            !blockedUsers.has(post.user_id) && !usersWhoBlockedMe.has(post.user_id)
          );
        }
      });
    });
  }

  //att os bloqueios e recarrega postagens
  onUserBlocked() {
    this.blockService.refreshBlockedUsers(this.currentUserId).then(() => {
      this.loadLikedPosts();
    });
  }
}
