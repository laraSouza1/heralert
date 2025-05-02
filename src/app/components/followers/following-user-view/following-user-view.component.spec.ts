import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowingUserViewComponent } from './following-user-view.component';

describe('FollowingUserViewComponent', () => {
  let component: FollowingUserViewComponent;
  let fixture: ComponentFixture<FollowingUserViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowingUserViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowingUserViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
