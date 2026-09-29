import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HelpPage } from './help.page';

describe('HelpPage', () => {
  let fixture: ComponentFixture<HelpPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HelpPage);
    fixture.detectChanges();
  });

  it('shows catalogue-first onboarding and festival data guidance', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Getting started');
    expect(text).toContain('Choose a festival');
    expect(text).toContain('Plan your sets');
    expect(text).toContain('Keep your route close');
    expect(text).toContain('Festival data');
    expect(text).toContain('Custom festivals');
    expect(text).not.toContain('Festival and line-up information is stored locally');
    expect(fixture.nativeElement.querySelector('.help-page__actions')).toBeNull();
  });
});
