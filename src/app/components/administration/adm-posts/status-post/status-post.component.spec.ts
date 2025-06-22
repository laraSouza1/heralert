import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusPostComponent } from './status-post.component';

describe('StatusPostComponent', () => {
  let component: StatusPostComponent;
  let fixture: ComponentFixture<StatusPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusPostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
