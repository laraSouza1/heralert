import { CommonModule, NgIf } from '@angular/common';
import { Component, Input, OnInit, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FollowService } from '../../../services/follow/follow.service';
import { BlockService } from '../../../services/block/block.service';

@Component({
  selector: 'app-follow-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, NgIf],
  template: `
    <p-button
      *ngIf="!isOwnProfile"
      [label]="isBlocked ? 'Bloqueado' : isFollowing ? 'Seguindo' : 'Seguir'"
      [icon]="isBlocked ? 'pi pi-ban' : isFollowing ? 'pi pi-check' : 'pi pi-user-plus'"
      [class]="isBlocked ? 'bt-block small' : isFollowing ? 'bt-follow2 small' : 'bt-follow small'"
      [disabled]="isBlocked"
      (onClick)="toggleFollow()">
    </p-button>
  `
})
export class FollowButtonComponent implements OnInit {

  @Input() targetUserId!: number;

  isFollowing = false;
  currentUserId!: number;
  isOwnProfile = false;
  isBlocked = false;

  constructor(private followService: FollowService, private blockService: BlockService) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = user.id;
    this.isOwnProfile = this.currentUserId === this.targetUserId;

    this.blockService.refreshBlockedUsers(this.currentUserId).then(() => {
      this.isBlocked = this.blockService.isBlocked(this.targetUserId);
    });

    //atualiza automaticamente o style do btn quando bloqueios mudarem
    this.blockService.getBlockedUsersChanges().subscribe(blockedSet => {
      this.isBlocked = blockedSet.has(this.targetUserId);
    });

    this.followService.refreshFollowings(this.currentUserId).then(() => {
      this.followService.getFollowingChanges().subscribe(followingSet => {
        this.isFollowing = followingSet.has(this.targetUserId);
      });
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

  updateBlockedState(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.blockService.refreshBlockedUsers(user.id).then(() => {
      this.isBlocked = this.blockService.isBlocked(this.targetUserId);
    });
  }
}
