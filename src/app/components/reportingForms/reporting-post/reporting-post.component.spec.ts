import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingPostComponent } from './reporting-post.component';

describe('ReportingPostComponent', () => {
  let component: ReportingPostComponent;
  let fixture: ComponentFixture<ReportingPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportingPostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportingPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
