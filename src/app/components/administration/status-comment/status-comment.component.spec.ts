import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusCommentComponent } from './status-comment.component';

describe('StatusCommentComponent', () => {
  let component: StatusCommentComponent;
  let fixture: ComponentFixture<StatusCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusCommentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
