import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeePostReportDetailComponent } from './see-post-report-detail.component';

describe('SeePostReportDetailComponent', () => {
  let component: SeePostReportDetailComponent;
  let fixture: ComponentFixture<SeePostReportDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeePostReportDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeePostReportDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
