import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PostComponent } from '../../shared/post/post.component';
import { BlockService } from '../../../services/block/block.service';

@Component({
  selector: 'app-posts-saved',
  imports: [
    CommonModule, FormsModule, PostComponent, IconFieldModule,
    InputTextModule, ButtonModule, InputIcon
  ],
  templateUrl: './posts-saved.component.html',
  styleUrl: './posts-saved.component.css'
})
export class PostsSavedComponent implements OnInit {

  savedPosts: any[] = [];
  currentUserId: number = 0;
  searchTerm = '';

  constructor(private http: HttpClient, private blockService: BlockService) { }

  ngOnInit() {

    //recupera informações do usuário do localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.currentUserId = user.id;
      this.blockService.refreshBlockedUsers(this.currentUserId).then(() => {
        this.loadSavedPosts();
      });
    }
  }

  //pesquisa
  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.loadSavedPosts();
  }

  //fetch posts salvos
  loadSavedPosts() {
    this.http.get<any>(`http://localhost:8085/api/posts/saved/${this.currentUserId}`, {
      params: { search: this.searchTerm }
    }).subscribe(response => {
      if (response.status) {
        const blockedUsers = this.blockService['blockedUsers'];
        this.savedPosts = response.data.filter((post: any) => !blockedUsers.has(post.user_id));
      }
    });
  }
}
