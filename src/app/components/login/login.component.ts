import { Component } from '@angular/core';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { Router, RouterModule } from '@angular/router';
import { MenuBarComponent } from '../shared/menu-bar/menu-bar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { Message, MessageModule } from 'primeng/message';
import { FollowService } from '../../services/follow/follow.service';
import { BlockService } from '../../services/block/block.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  providers: [MessageService],
  imports: [
    InputIcon, IconField, InputTextModule, FormsModule, ButtonModule, PasswordModule,
    MenuBarComponent, FooterComponent, MessageModule, Message, NgIf, RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {

  isPasswordVisible: boolean = false;
  usernameOrEmail: string = '';
  password: string = '';
  emailOrUsernameError: boolean = false;
  passwordError: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private followService: FollowService,
    private blockService: BlockService,
    private messageService: MessageService
  ) { }

  //navegações dos btns do form ----------------
  navigateToSignIn() {
    this.router.navigate(['/sign-in']);
  }

  navigateToFY() {
    this.router.navigate(['/for-you']);
  }

  //conteudo do form ----------------

  //deixar pass visível ou não
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  //executa login pro back
  login() {
    this.clearErrors();

    const loginData = {
      usernameOrEmail: this.usernameOrEmail,
      password: this.password
    };

    this.http.post("http://localhost:8085/api/login", loginData).subscribe({
      next: (response: any) => {
        if (response.status) {
          console.log('Login bem-sucedido!', response.data);

          localStorage.clear();

          //limpa dados anteriores
          this.followService.clearFollowings();
          this.blockService.clear();

          localStorage.setItem('user', JSON.stringify(response.data)); //pega novos dados o user recem logado para o localstorage

          this.followService.refreshFollowings(response.data.id).then(() => {
            this.router.navigate(['/for-you']);
          });
        }
      },
      error: (error) => {
        console.error('Erro no login:', error);

        this.emailOrUsernameError = false;
        this.passwordError = false;

        if (error.status === 401) {
          const msg = error.error?.message || '';
          if (msg.includes('Usuário não encontrado')) {
            this.emailOrUsernameError = true;
          } else if (msg.includes('Senha incorreta')) {
            this.passwordError = true;
          }
        } else {
          alert('Erro ao tentar fazer login. Por favor, tente novamente.');
        }
      }
    });
  }

  //limpa erros do form
  clearErrors() {
    this.emailOrUsernameError = false;
    this.passwordError = false;
  }

}
