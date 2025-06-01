import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePostsComponent } from './change-posts.component';

describe('ChangePostsComponent', () => {
  let component: ChangePostsComponent;
  let fixture: ComponentFixture<ChangePostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePostsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangePostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
