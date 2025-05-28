import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LikesNotificationsComponent } from './likes-notifications.component';

describe('LikesNotificationsComponent', () => {
  let component: LikesNotificationsComponent;
  let fixture: ComponentFixture<LikesNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LikesNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LikesNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
