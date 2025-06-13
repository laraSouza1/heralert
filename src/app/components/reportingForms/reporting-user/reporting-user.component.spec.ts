import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingUserComponent } from './reporting-user.component';

describe('ReportingUserComponent', () => {
  let component: ReportingUserComponent;
  let fixture: ComponentFixture<ReportingUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportingUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportingUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
