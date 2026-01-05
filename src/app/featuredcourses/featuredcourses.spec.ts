import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Featuredcourses } from './featuredcourses';

describe('Featuredcourses', () => {
  let component: Featuredcourses;
  let fixture: ComponentFixture<Featuredcourses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Featuredcourses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Featuredcourses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
