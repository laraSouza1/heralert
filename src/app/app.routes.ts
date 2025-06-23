import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { LoginComponent } from './components/login/login.component';
import { SingInComponent } from './components/sign-in/sing-in/sign-in.component';
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
import { AdministrationLayoutComponent } from './layouts/administration-layout/administration-layout.component';
import { UsersListComponent } from './components/administration/adm-users/users-list/users-list.component';
import { TagsAdministrationComponent } from './components/administration/tags-administration/tags-administration.component';
import { UsersReportsComponent } from './components/administration/adm-users/users-reports/users-reports.component';
import { PostsReportsComponent } from './components/administration/adm-posts/posts-reports/posts-reports.component';
import { CommentsReportsComponent } from './components/administration/adm-comments/comments-reports/comments-reports.component';
import { UsersToBanListComponent } from './components/administration/adm-users/users-to-ban-list/users-to-ban-list.component';
import { MyComplaintsComponent } from './components/users-n-profiles/profile-user-logged/config-options/my-complaints/my-complaints.component';
import { AdminGuard } from './guards/admin/admin.guard';

//rotas acessíveis ao usuário
export const routes: Routes = [
  //rotas sem LeftSideComponent/RightSideComponent
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sign-in', component: SingInComponent },
  { path: 'change-password-request', component: EmailToChangepassComponent },
  { path: 'change-password/:userId/:token', component: ChangePasswordComponent },

  //rotas com LeftSideComponent/RightSideComponent (usam layout com perfil/menu lateral e chat)
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
      { path: 'notifications', component: NotificationsComponent },
      { path: 'my-complaints', component: MyComplaintsComponent }
    ]
  },

  //rotas com MenuAdministrationComponent (usam layout com menu de adms)
  {
    path: '',
    component: AdministrationLayoutComponent,
    children: [
      { path: 'users-list', component: UsersListComponent, canActivate: [AdminGuard] },
      { path: 'tags-administration', component: TagsAdministrationComponent, canActivate: [AdminGuard] },
      { path: 'users-reports', component: UsersReportsComponent, canActivate: [AdminGuard] },
      { path: 'posts-reports', component: PostsReportsComponent, canActivate: [AdminGuard] },
      { path: 'comments-reports', component: CommentsReportsComponent, canActivate: [AdminGuard] },
      { path: 'users-to-ban-list', component: UsersToBanListComponent, canActivate: [AdminGuard] },
    ]
  }
];
