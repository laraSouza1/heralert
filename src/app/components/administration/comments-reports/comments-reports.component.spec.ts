import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsReportsComponent } from './comments-reports.component';

describe('CommentsReportsComponent', () => {
  let component: CommentsReportsComponent;
  let fixture: ComponentFixture<CommentsReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentsReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentsReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
