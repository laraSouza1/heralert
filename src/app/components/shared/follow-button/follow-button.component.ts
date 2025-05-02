import { CommonModule, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FollowService } from '../../../services/services/follow.service';

@Component({
  selector: 'app-follow-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, NgIf],
  template: `
    <p-button *ngIf="!isOwnProfile" [label]="isFollowing ? 'Seguindo' : 'Seguir'" [icon]="isFollowing ? 'pi pi-check' : 'pi pi-user-plus'" [class]="isFollowing ? 'bt-follow2 small' : 'bt-follow small'" (onClick)="toggleFollow()"></p-button>
  `
})
export class FollowButtonComponent implements OnInit {

  @Input() targetUserId!: number;

  isFollowing = false;
  currentUserId!: number;
  isOwnProfile = false;

  constructor(private followService: FollowService) { }

  ngOnInit(): void {
    //busca os seguindos do user logado
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = user.id;
    this.isOwnProfile = this.currentUserId === this.targetUserId;

    this.followService.refreshFollowings(this.currentUserId);

    this.followService.getFollowingChanges().subscribe(followingSet => {
      this.isFollowing = followingSet.has(this.targetUserId);
    });
  }

  //função para mudança do botão de seguir/seguindo
  toggleFollow(): void {
    if (this.isFollowing) {
      this.followService.unfollow(this.currentUserId, this.targetUserId);
    } else {
      this.followService.follow(this.currentUserId, this.targetUserId);
    }
  }
}