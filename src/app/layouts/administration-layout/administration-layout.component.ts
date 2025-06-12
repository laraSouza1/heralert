import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuAdministrationComponent } from '../../components/shared/menu-administration/menu-administration.component';

@Component({
  selector: 'app-administration-layout',
  imports: [RouterOutlet, MenuAdministrationComponent],
  templateUrl: './administration-layout.component.html',
  styleUrl: './administration-layout.component.css'
})
export class AdministrationLayoutComponent {

}
