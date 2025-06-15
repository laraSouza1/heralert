import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsReportsComponent } from './posts-reports.component';

describe('PostsReportsComponent', () => {
  let component: PostsReportsComponent;
  let fixture: ComponentFixture<PostsReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostsReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
