import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowersUserViewComponent } from './followers-user-view.component';

describe('FollowersUserViewComponent', () => {
  let component: FollowersUserViewComponent;
  let fixture: ComponentFixture<FollowersUserViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowersUserViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowersUserViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
