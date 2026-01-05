import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseDataModel } from './course-data-model';

describe('CourseDataModel', () => {
  let component: CourseDataModel;
  let fixture: ComponentFixture<CourseDataModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseDataModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseDataModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
