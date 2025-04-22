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
  selector: 'app-posts-user',
  imports: [
    CommonModule,
    FormsModule,
    PostComponent,
    IconFieldModule,
    InputTextModule,
    ButtonModule,
    InputIcon
  ],
  templateUrl: './posts-user.component.html',
  styleUrl: './posts-user.component.css'
})
export class PostsUserComponent implements OnInit {
  userPosts: any[] = [];
  currentUserId: number = 0;
  searchTerm = '';

  constructor(private http: HttpClient) { }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.loadUserPosts();
  }

  loadUserPosts() {
    this.http.get<any>(`http://localhost:8085/api/posts/user/${this.currentUserId}`, {
      params: { search: this.searchTerm }
    }).subscribe(response => {
      if (response.status) {
        this.userPosts = response.data;
      }
    });
  }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.currentUserId = user.id;
      this.loadUserPosts();
    }
  }
}
