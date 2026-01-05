import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Trustedby } from './trustedby';

describe('Trustedby', () => {
  let component: Trustedby;
  let fixture: ComponentFixture<Trustedby>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Trustedby]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Trustedby);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
