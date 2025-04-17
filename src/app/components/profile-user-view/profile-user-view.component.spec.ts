import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileUserViewComponent } from './profile-user-view.component';

describe('ProfileUserViewComponent', () => {
  let component: ProfileUserViewComponent;
  let fixture: ComponentFixture<ProfileUserViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileUserViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileUserViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
