import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersToBanListComponent } from './users-to-ban-list.component';

describe('UsersToBanListComponent', () => {
  let component: UsersToBanListComponent;
  let fixture: ComponentFixture<UsersToBanListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersToBanListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersToBanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
