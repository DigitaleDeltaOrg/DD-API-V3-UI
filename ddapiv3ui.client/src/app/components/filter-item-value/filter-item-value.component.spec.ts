import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterItemValueComponent } from './filter-item-value.component';

describe('QueryItemValueComponent', () => {
  let component: FilterItemValueComponent;
  let fixture: ComponentFixture<FilterItemValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterItemValueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FilterItemValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
