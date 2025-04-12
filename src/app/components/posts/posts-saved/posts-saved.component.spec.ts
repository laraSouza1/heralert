import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsSavedComponent } from './posts-saved.component';

describe('PostsSavedComponent', () => {
  let component: PostsSavedComponent;
  let fixture: ComponentFixture<PostsSavedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsSavedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostsSavedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
