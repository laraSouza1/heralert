import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SingInComponent } from './components/sing-in/sign-in.component';
import { SupportComponent } from './components/support/support.component';
import { ForYouComponent } from './components/for-you/for-you.component';
import { CreatePostComponent } from './components/shared/create-post/create-post.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sign-in', component: SingInComponent },
  { path: 'support', component: SupportComponent },
  { path: 'for-you', component: ForYouComponent },
  { path: 'profile', component: ProfileComponent },
];
