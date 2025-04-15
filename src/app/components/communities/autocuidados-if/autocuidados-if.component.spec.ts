import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocuidadosIFComponent } from './autocuidados-if.component';

describe('AutocuidadosIFComponent', () => {
  let component: AutocuidadosIFComponent;
  let fixture: ComponentFixture<AutocuidadosIFComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocuidadosIFComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutocuidadosIFComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
