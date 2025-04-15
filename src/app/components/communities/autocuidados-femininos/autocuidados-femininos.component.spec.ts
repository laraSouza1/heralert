import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocuidadosFemininosComponent } from './autocuidados-femininos.component';

describe('AutocuidadosFemininosComponent', () => {
  let component: AutocuidadosFemininosComponent;
  let fixture: ComponentFixture<AutocuidadosFemininosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocuidadosFemininosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutocuidadosFemininosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
