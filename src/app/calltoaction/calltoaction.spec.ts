import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Calltoaction } from './calltoaction';

describe('Calltoaction', () => {
  let component: Calltoaction;
  let fixture: ComponentFixture<Calltoaction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Calltoaction]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Calltoaction);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
