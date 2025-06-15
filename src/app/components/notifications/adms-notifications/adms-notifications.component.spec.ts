import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmsNotificationsComponent } from './adms-notifications.component';

describe('AdmsNotificationsComponent', () => {
  let component: AdmsNotificationsComponent;
  let fixture: ComponentFixture<AdmsNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmsNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmsNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
