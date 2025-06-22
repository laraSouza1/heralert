import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeeUserReportComponent } from './see-user-report.component';

describe('SeeUserReportComponent', () => {
  let component: SeeUserReportComponent;
  let fixture: ComponentFixture<SeeUserReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeeUserReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeeUserReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
