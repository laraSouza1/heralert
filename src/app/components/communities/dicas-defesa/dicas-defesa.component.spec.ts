import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DicasDefesaComponent } from './dicas-defesa.component';

describe('DicasDefesaComponent', () => {
  let component: DicasDefesaComponent;
  let fixture: ComponentFixture<DicasDefesaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DicasDefesaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DicasDefesaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
