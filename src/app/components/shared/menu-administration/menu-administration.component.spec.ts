import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuAdministrationComponent } from './menu-administration.component';

describe('MenuAdministrationComponent', () => {
  let component: MenuAdministrationComponent;
  let fixture: ComponentFixture<MenuAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuAdministrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
