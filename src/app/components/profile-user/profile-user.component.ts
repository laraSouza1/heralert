import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { EditProfileComponent } from '../edit-profile/edit-profile.component';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-profile-user',
  imports: [
    ButtonModule, EditProfileComponent, DialogModule, MenuModule, ToastModule
  ],
  templateUrl: './profile-user.component.html',
  styleUrl: './profile-user.component.css'
})
export class ProfileUserComponent {

  @Output() openFollowingModal = new EventEmitter<void>();
  @Output() openFollowersModal = new EventEmitter<void>();

  @ViewChild(EditProfileComponent) editProfileComponent!: EditProfileComponent;

  user: any;
  showEditProfileModal: boolean = false;
  formValues: any;
  items: MenuItem[] | undefined;
  followingCount = 0;
  followersCount = 0;

  constructor(private messageService: MessageService, private http: HttpClient) { }

  ngOnInit() {

    this.items = [
      {
        items: [
          { label: 'Configurações do perfil', icon: 'pi pi-cog' }
        ]
      }
    ];

    //pega data de criação de conta + formatação para meses
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);

      const date = new Date(this.user.created_at);
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      this.user.memberSince = `Membro desde ${meses[date.getMonth()]} ${date.getFullYear()}`;
    }

    this.loadCounts();
  }

  //formatação de data
  onFormDataChanged(data: any) {
    this.formValues = {
      ...this.formValues,
      ...data
    };
  }

  //contagem de seguidores e seguindo
  loadCounts(): void {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    this.http.get<any>(`http://localhost:8085/api/follows/following-users/${currentUser.id}`).subscribe({
      next: (res) => {
        if (res.status) {
          this.followingCount = res.data.length;
        }
      }
    });

    this.http.get<any>(`http://localhost:8085/api/follows/followers-users/${currentUser.id}`).subscribe({
      next: (res) => {
        if (res.status) {
          this.followersCount = res.data.length;
        }
      }
    });
  }

  //para abertura de modais se seuindo e seguidores
  abrirFollowing() {
    this.openFollowingModal.emit();
  }

  abrirFollowers() {
    this.openFollowersModal.emit();
  }

  //para abertura de modal de edit-profile e ações de salvamento ------------------

  openEditProfileModal() {
    this.showEditProfileModal = true;
    setTimeout(() => {
      this.editProfileComponent.resetForm(this.user);
    });
  }

  closeEditProfileModal() {
    this.showEditProfileModal = false;
  }

  //salva mudanças e envia para a bd
  saveProfile() {
    if (!this.formValues) {
      return;
    }

    const updatedUser = {
      ...this.user,
      ...this.formValues,
      profile_pic: this.formValues.profile_pic_url ?? this.user.profile_pic,
      cover_pic: this.formValues.cover_pic_url ?? this.user.cover_pic
    };

    const apiUrl = 'http://localhost:8085/api/users/' + this.user.id;

    this.http.put(apiUrl, updatedUser).subscribe({
      next: (response) => {
        this.profileEdited();
        this.user = updatedUser;
        localStorage.setItem('user', JSON.stringify(this.user));
        window.dispatchEvent(new Event('user-updated'));
        this.closeEditProfileModal();
      },
      error: (err) => {
        console.error("Erro ao salvar perfil:", err);
        this.messageService.add({ severity: 'error', summary: 'Erro ao salvar perfil!' });
      }
    });
  }

  //mensagem de perfil editado com sucesso
  profileEdited() {
    this.messageService.add({ severity: 'success', summary: 'Perfil atualizado com sucesso!' });
  }
}
