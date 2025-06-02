import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailToChangepassComponent } from './email-to-changepass.component';

describe('EmailToChangepassComponent', () => {
  let component: EmailToChangepassComponent;
  let fixture: ComponentFixture<EmailToChangepassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailToChangepassComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailToChangepassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
