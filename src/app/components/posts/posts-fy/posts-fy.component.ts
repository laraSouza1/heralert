import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PostComponent } from '../../shared/post/post.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputIcon } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-posts-fy',
  standalone: true,
  imports: [
    CommonModule, FormsModule, PostComponent, IconFieldModule, InputTextModule,
    ButtonModule, InputIcon, SelectModule
  ],
  templateUrl: './posts-fy.component.html',
  styleUrls: ['./posts-fy.component.css']
})
export class PostsFYComponent {

  @Input() posts: any[] = [];
  @Input() currentUserId: any;
  searchTerm = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {

    //recupera informações do usuário do localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.currentUserId = user.id;
    }

    this.loadPosts();
  }

  //pesquisa
  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.loadPosts();
  }

  //fetch de todos os posts
  loadPosts() {
    this.http.get<any>('http://localhost:8085/api/posts', {
      params: {
        userId: this.currentUserId,
        search: this.searchTerm
      }
    }).subscribe(response => {
      if (response.status) {
        this.posts = response.data;
      }
    });
  }

}
