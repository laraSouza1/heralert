import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowingUserComponent } from './following-user.component';

describe('FollowingUserComponent', () => {
  let component: FollowingUserComponent;
  let fixture: ComponentFixture<FollowingUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowingUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowingUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
