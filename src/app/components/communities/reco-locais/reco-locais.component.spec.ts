import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoLocaisComponent } from './reco-locais.component';

describe('RecoLocaisComponent', () => {
  let component: RecoLocaisComponent;
  let fixture: ComponentFixture<RecoLocaisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecoLocaisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecoLocaisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
