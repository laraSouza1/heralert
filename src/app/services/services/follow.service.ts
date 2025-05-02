import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FollowService {

  private loaded = false;
  private followingUsers: Set<number> = new Set();
  private followingChanged = new BehaviorSubject<Set<number>>(this.followingUsers);
  private followerCountChanged = new Subject<void>();

  constructor(private http: HttpClient) { }

  //pega os following para login
  refreshFollowings(userId: number): Promise<void> {
    if (this.loaded) return Promise.resolve();

    return new Promise((resolve, reject) => {
      this.http.get<any>(`http://localhost:8085/api/follows/following/${userId}`).subscribe({
        next: (res) => {
          if (res.status) {
            this.followingUsers = new Set(res.data.map((u: any) => u.following_id));
            this.followingChanged.next(new Set(this.followingUsers));
            this.loaded = true;
          }
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

  isFollowing(userId: number): boolean {
    return this.followingUsers.has(userId);
  }

  //para mudanças de ação
  getFollowingChanges(): Observable<Set<number>> {
    return this.followingChanged.asObservable();
  }

  getFollowerCountChanged(): Observable<void> {
    return this.followerCountChanged.asObservable();
  }

  //função de seguir
  follow(currentUserId: number, targetUserId: number): void {
    this.http.post('http://localhost:8085/api/follows', {
      follower_id: currentUserId,
      following_id: targetUserId
    }).subscribe(() => {
      this.followingUsers.add(targetUserId);
      this.followingChanged.next(new Set(this.followingUsers));

      this.followerCountChanged.next();
    });
  }

  //função de deixar de seguir
  unfollow(currentUserId: number, targetUserId: number): void {
    this.http.delete('http://localhost:8085/api/follows', {
      params: {
        follower_id: currentUserId,
        following_id: targetUserId
      }
    }).subscribe(() => {
      this.followingUsers.delete(targetUserId);
      this.followingChanged.next(new Set(this.followingUsers));

      this.followerCountChanged.next();
    });
  }

  //limpa infos ao dar logout
  clearFollowings(): void {
    this.loaded = false;
    this.followingUsers.clear();
    this.followingChanged.next(new Set());

    this.followerCountChanged = new Subject<void>();
  }
}