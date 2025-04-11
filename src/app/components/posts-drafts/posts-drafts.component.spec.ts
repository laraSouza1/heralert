import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsDraftsComponent } from './posts-drafts.component';

describe('PostsDraftsComponent', () => {
  let component: PostsDraftsComponent;
  let fixture: ComponentFixture<PostsDraftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsDraftsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostsDraftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
