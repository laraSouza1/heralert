import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlockService {

  private blockedUsers: Set<number> = new Set();
  private blocksLoaded = false;
  private blockedUsersChanged = new BehaviorSubject<Set<number>>(this.blockedUsers);

  constructor(private http: HttpClient) { }

  refreshBlockedUsers(userId: number): Promise<void> {
    if (this.blocksLoaded) return Promise.resolve();

    return new Promise((resolve, reject) => {
      this.http.get<any>(`http://localhost:8085/api/blocks/${userId}`).subscribe({
        next: res => {
          if (res.status) {
            this.blockedUsers = new Set(res.data.map((u: any) => u.blocked_id));
            this.blocksLoaded = true;
            this.blockedUsersChanged.next(new Set(this.blockedUsers));
          }
          resolve();
        },
        error: err => reject(err)
      });
    });
  }

  isBlocked(userId: number): boolean {
    return this.blockedUsers.has(userId);
  }

  blockUser(blockerId: number, blockedId: number): Observable<any> {
    return this.http.post('http://localhost:8085/api/blocks', {
      blocker_id: blockerId,
      blocked_id: blockedId
    });
  }

  unblockUser(blockerId: number, blockedId: number): Observable<any> {
    return this.http.delete('http://localhost:8085/api/blocks', {
      params: { blocker_id: blockerId, blocked_id: blockedId }
    });
  }

  getBlockedUsersChanges(): Observable<Set<number>> {
    return this.blockedUsersChanged.asObservable();
  }

  clear(): void {
    this.blockedUsers.clear();
    this.blocksLoaded = false;
    this.blockedUsersChanged.next(new Set());
  }  
}