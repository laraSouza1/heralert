import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsAdministrationComponent } from './tags-administration.component';

describe('TagsAdministrationComponent', () => {
  let component: TagsAdministrationComponent;
  let fixture: ComponentFixture<TagsAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagsAdministrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagsAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
