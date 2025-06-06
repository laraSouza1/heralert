import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RightSideComponent } from '../../components/shared/right-side/right-side.component';
import { LeftSideComponent } from '../../components/shared/left-side/left-side.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RightSideComponent, LeftSideComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

}
