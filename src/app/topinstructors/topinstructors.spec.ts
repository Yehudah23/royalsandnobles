import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Topinstructors } from './topinstructors';

describe('Topinstructors', () => {
  let component: Topinstructors;
  let fixture: ComponentFixture<Topinstructors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Topinstructors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Topinstructors);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
