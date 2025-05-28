import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsNotificationsComponent } from './comments-notifications.component';

describe('CommentsNotificationsComponent', () => {
  let component: CommentsNotificationsComponent;
  let fixture: ComponentFixture<CommentsNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentsNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentsNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
