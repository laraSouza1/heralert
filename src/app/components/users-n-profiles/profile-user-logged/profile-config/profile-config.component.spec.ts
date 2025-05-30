import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileConfigComponent } from './profile-config.component';

describe('ProfileConfigComponent', () => {
  let component: ProfileConfigComponent;
  let fixture: ComponentFixture<ProfileConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
