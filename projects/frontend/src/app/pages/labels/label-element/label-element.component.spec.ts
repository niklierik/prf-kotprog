import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelElementComponent } from './label-element.component';

describe('LabelElementComponent', () => {
  let component: LabelElementComponent;
  let fixture: ComponentFixture<LabelElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabelElementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabelElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
