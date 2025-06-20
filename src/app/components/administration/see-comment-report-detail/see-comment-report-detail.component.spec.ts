import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeeCommentReportDetailComponent } from './see-comment-report-detail.component';

describe('SeeCommentReportDetailComponent', () => {
  let component: SeeCommentReportDetailComponent;
  let fixture: ComponentFixture<SeeCommentReportDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeeCommentReportDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeeCommentReportDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
