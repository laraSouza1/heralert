import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

interface Post {
  id: number;
  userId: number;
  username: string;
  userImage?: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  likes: number;
  comments: number;
  favorites: number;
}

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [TableModule, ButtonModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent {
  @Input() post!: Post;
}
