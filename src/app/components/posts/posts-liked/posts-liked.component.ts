import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PostComponent } from '../../shared/post/post.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-posts-liked',
  imports: [
    CommonModule,
    FormsModule,
    PostComponent,
    IconFieldModule,
    InputTextModule,
    ButtonModule,
    InputIcon
  ],
  templateUrl: './posts-liked.component.html',
  styleUrl: './posts-liked.component.css'
})
export class PostsLikedComponent implements OnInit {
  likedPosts: any[] = [];
  currentUserId: number = 0;
  searchTerm = '';

  constructor(private http: HttpClient) { }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.loadLikedPosts();
  }

  loadLikedPosts() {
    this.http.get<any>(`http://localhost:8085/api/posts/liked/${this.currentUserId}`, {
      params: { search: this.searchTerm }
    }).subscribe(response => {
      if (response.status) {
        this.likedPosts = response.data;
      }
    });
  }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.currentUserId = user.id;
      this.loadLikedPosts();
    }
  }
}
