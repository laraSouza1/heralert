import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserToBanDetailComponent } from './user-to-ban-detail.component';

describe('UserToBanDetailComponent', () => {
  let component: UserToBanDetailComponent;
  let fixture: ComponentFixture<UserToBanDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserToBanDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserToBanDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
