import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PostComponent } from '../shared/post/post.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputIcon } from 'primeng/inputicon';

@Component({
  selector: 'app-posts-fy',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PostComponent,
    IconFieldModule,
    InputTextModule,
    ButtonModule,
    InputIcon
  ],
  templateUrl: './posts-fy.component.html',
  styleUrls: ['./posts-fy.component.css']
})
export class PostsFYComponent {
  @Input() posts: any[] = [];
  @Input() currentUserId: any;
}
