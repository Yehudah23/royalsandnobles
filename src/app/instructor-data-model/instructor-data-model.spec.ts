import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorDataModel } from './instructor-data-model';

describe('InstructorDataModel', () => {
  let component: InstructorDataModel;
  let fixture: ComponentFixture<InstructorDataModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorDataModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorDataModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
