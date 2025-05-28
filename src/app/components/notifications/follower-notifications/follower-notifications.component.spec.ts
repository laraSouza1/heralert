import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowerNotificationsComponent } from './follower-notifications.component';

describe('FollowerNotificationsComponent', () => {
  let component: FollowerNotificationsComponent;
  let fixture: ComponentFixture<FollowerNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowerNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowerNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
