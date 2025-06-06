import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { LoginComponent } from './components/login/login.component';
import { SingInComponent } from './components/sign-in/sing-in/sign-in.component';
import { SupportComponent } from './components/support/support.component';
import { ForYouComponent } from './components/for-you-page/for-you/for-you.component';
import { ProfileComponent } from './components/users-n-profiles/profile-user-logged/profile/profile.component';
import { AssuntosGeraisComponent } from './components/communities/assuntos-gerais/assuntos-gerais.component';
import { AutocuidadosFemininosComponent } from './components/communities/autocuidados-femininos/autocuidados-femininos.component';
import { AutocuidadosIFComponent } from './components/communities/autocuidados-if/autocuidados-if.component';
import { DicasDefesaComponent } from './components/communities/dicas-defesa/dicas-defesa.component';
import { RecoLocaisComponent } from './components/communities/reco-locais/reco-locais.component';
import { ProfileViewComponent } from './components/users-n-profiles/profile-another-user/profile-view/profile-view.component';
import { ViewPostComponent } from './components/posts/view-post/view-post.component';
import { PostTagComponent } from './components/tags/posts-tag/post-tag.component';
import { CommunitiesComponent } from './components/communities/communities/communities.component';
import { ProfileConfigComponent } from './components/users-n-profiles/profile-user-logged/profile-config/profile-config.component';
import { NotificationsComponent } from './components/notifications/notifications/notifications.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { EmailToChangepassComponent } from './components/email-to-changepass/email-to-changepass.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

//rotas acessíveis ao usuário
export const routes: Routes = [
  //rotas SEM LeftSideComponent/RightSideComponent
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sign-in', component: SingInComponent },
  { path: 'change-password-request', component: EmailToChangepassComponent },
  { path: 'change-password/:userId/:token', component: ChangePasswordComponent },

  //rotas COM LeftSideComponent/RightSideComponent (usam layout com perfil e chat)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'for-you', component: ForYouComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'assuntos-gerais', component: AssuntosGeraisComponent },
      { path: 'dicas-defesa', component: DicasDefesaComponent },
      { path: 'autocuidados-if', component: AutocuidadosIFComponent },
      { path: 'autocuidados-femininos', component: AutocuidadosFemininosComponent },
      { path: 'reco-locais', component: RecoLocaisComponent },
      { path: 'profile-view/:username', component: ProfileViewComponent },
      { path: 'view-post/:idSlug', component: ViewPostComponent },
      { path: 'post-tag', component: PostTagComponent },
      { path: 'communities', component: CommunitiesComponent },
      { path: 'profile-config', component: ProfileConfigComponent },
      { path: 'notifications', component: NotificationsComponent }
    ]
  }
];
