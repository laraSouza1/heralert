import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { PostsFYComponent } from '../posts/posts-fy/posts-fy.component';
import { PostsFollowingComponent } from '../posts/posts-following/posts-following.component';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-posts',
  imports: [
    PostsFYComponent,
    PostsFollowingComponent,
    ButtonModule,
    CommonModule
  ],
  templateUrl: './change-posts.component.html',
  styleUrl: './change-posts.component.css'
})
export class ChangePostsComponent {

  activeTab: 'fy' | 'following' = 'fy';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab === 'following' || savedTab === 'fy') {
      this.activeTab = savedTab as 'fy' | 'following';
    }
  }

  setActiveTab(tab: 'fy' | 'following'): void {
    this.activeTab = tab;
    localStorage.setItem('activeTab', tab);
  }

}
