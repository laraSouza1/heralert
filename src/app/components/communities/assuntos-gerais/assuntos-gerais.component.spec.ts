import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssuntosGeraisComponent } from './assuntos-gerais.component';

describe('AssuntosGeraisComponent', () => {
  let component: AssuntosGeraisComponent;
  let fixture: ComponentFixture<AssuntosGeraisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssuntosGeraisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssuntosGeraisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
