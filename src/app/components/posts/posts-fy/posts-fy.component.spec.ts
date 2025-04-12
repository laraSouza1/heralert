import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsFYComponent } from './posts-fy.component';

describe('PostsFYComponent', () => {
  let component: PostsFYComponent;
  let fixture: ComponentFixture<PostsFYComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsFYComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostsFYComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
