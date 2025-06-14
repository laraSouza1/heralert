import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingCommentComponent } from './reporting-comment.component';

describe('ReportingCommentComponent', () => {
  let component: ReportingCommentComponent;
  let fixture: ComponentFixture<ReportingCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportingCommentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportingCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
