import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowersUserComponent } from './followers-user.component';

describe('FollowersUserComponent', () => {
  let component: FollowersUserComponent;
  let fixture: ComponentFixture<FollowersUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowersUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowersUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
