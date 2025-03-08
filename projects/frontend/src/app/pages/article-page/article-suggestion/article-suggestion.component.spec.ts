import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleSuggestionComponent } from './article-suggestion.component';

describe('ArticleSuggestionComponent', () => {
  let component: ArticleSuggestionComponent;
  let fixture: ComponentFixture<ArticleSuggestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleSuggestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleSuggestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
