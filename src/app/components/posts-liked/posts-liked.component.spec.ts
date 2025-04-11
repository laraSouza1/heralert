import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsLikedComponent } from './posts-liked.component';

describe('PostsLikedComponent', () => {
  let component: PostsLikedComponent;
  let fixture: ComponentFixture<PostsLikedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsLikedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostsLikedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
