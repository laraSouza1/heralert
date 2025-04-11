import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsFollowingComponent } from './posts-following.component';

describe('PostsFollowingComponent', () => {
  let component: PostsFollowingComponent;
  let fixture: ComponentFixture<PostsFollowingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsFollowingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostsFollowingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
