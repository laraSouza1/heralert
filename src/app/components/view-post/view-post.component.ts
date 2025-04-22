import { Component, OnInit } from '@angular/core';
import { PostComponent } from '../shared/post/post.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RightSideComponent } from '../shared/right-side/right-side.component';
import { LeftSideComponent } from '../shared/left-side/left-side.component';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-post',
  providers: [MessageService, ConfirmationService],
  imports: [PostComponent, RightSideComponent, LeftSideComponent,
    CommonModule],
  templateUrl: './view-post.component.html',
  styleUrl: './view-post.component.css'
})
export class ViewPostComponent implements OnInit {
  post: any;
  tags: string[] = [];
  currentUserId: any;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = user?.id;

    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.http.get<any>(`http://localhost:8085/api/posts/${postId}`, {
        params: { userId: this.currentUserId }
      }).subscribe(response => {
        if (response.status) {
          this.post = response.data;
          this.tags = this.post.tags;
        }
      });
    }
  }
}
