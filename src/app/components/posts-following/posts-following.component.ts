import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PostComponent } from '../shared/post/post.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputIcon } from 'primeng/inputicon';

@Component({
  selector: 'app-posts-following',
  imports: [
    CommonModule,
    FormsModule,
    PostComponent,
    IconFieldModule,
    InputTextModule,
    ButtonModule,
    InputIcon
  ],
  templateUrl: './posts-following.component.html',
  styleUrl: './posts-following.component.css'
})
export class PostsFollowingComponent {

}
