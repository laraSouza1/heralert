import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlockService {

  private blockedUsers: Set<number> = new Set();
  private usersWhoBlockedMe: Set<number> = new Set();
  private blocksLoaded = false;
  private blockedUsersChanged = new BehaviorSubject<Set<number>>(this.blockedUsers);
  private allBlockedChanged = new BehaviorSubject<{ blocked: Set<number>, blockedBy: Set<number> }>({
    blocked: this.blockedUsers,
    blockedBy: this.usersWhoBlockedMe
  });

  constructor(private http: HttpClient) { }

  refreshBlockedUsers(userId: number): Promise<void> {
    if (this.blocksLoaded) return Promise.resolve();

    return new Promise((resolve, reject) => {
      Promise.all([
        //busca quem o usuário bloqueou e quem bloqueou o user
        this.http.get<any>(`http://localhost:8085/api/blocks/${userId}`).toPromise(),
        this.http.get<any>(`http://localhost:8085/api/blocks/blockers/${userId}`).toPromise()
      ]).then(([blockedRes, blockerRes]) => {
        if (blockedRes.status) {
          //para popular e criar nova lista de user
          this.blockedUsers = new Set(blockedRes.data.map((u: any) => u.blocked_id));
          this.blockedUsersChanged.next(new Set(this.blockedUsers));
        }
        if (blockerRes.status) {
          this.usersWhoBlockedMe = new Set(blockerRes.data.map((u: any) => u.blocker_id));
        }

        this.allBlockedChanged.next({
          blocked: new Set(this.blockedUsers),
          blockedBy: new Set(this.usersWhoBlockedMe)
        });

        this.blocksLoaded = true;
        resolve();
      }).catch(err => reject(err));
    });
  }

  private blockAction = new Subject<void>();
  blockAction$ = this.blockAction.asObservable();

  notifyBlockAction() {
    this.blockAction.next();
  }

  //para mudanças em ambas as listas
  getAllBlockedChanges(): Observable<{ blocked: Set<number>, blockedBy: Set<number> }> {
    return this.allBlockedChanged.asObservable();
  }

  //verifica usuário na lista de bloqueados
  isBlocked(userId: number): boolean {
    return this.blockedUsers.has(userId);
  }

  //para bloquear user
  blockUser(blockerId: number, blockedId: number): Observable<any> {
    return this.http.post('http://localhost:8085/api/blocks', {
      blocker_id: blockerId,
      blocked_id: blockedId
    }).pipe(
      tap(() => {
        //deixar de seguir o bloqueador pelo usuário bloqueado
        this.http.delete('http://localhost:8085/api/follows', {
          params: { follower_id: blockedId.toString(), following_id: blockerId.toString() }
        }).subscribe(
          () => console.log('O usuário bloqueado deixou de seguir o bloqueador com sucesso'),
          error => console.error('Erro:', error)
        );

        this.clear();
        this.notifyBlockAction();
      })
    );
  }

  //para desbloquear um usuário
  unblockUser(blockerId: number, blockedId: number): Observable<any> {
    return this.http.delete('http://localhost:8085/api/blocks', {
      params: { blocker_id: blockerId, blocked_id: blockedId }
    }).pipe(
      tap(() => {
        this.clear();
        this.notifyBlockAction();
      })
    );
  }

  //mudanças na lista de bloqueados pelo atual
  getBlockedUsersChanges(): Observable<Set<number>> {
    return this.blockedUsersChanged.asObservable();
  }

  //limpa infos ao dar logout
  clear(): void {
    this.blockedUsers.clear();
    this.blocksLoaded = false;
    this.blockedUsersChanged.next(new Set());
  }
}
