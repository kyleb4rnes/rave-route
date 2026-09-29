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
    expect(text).toContain('Budget');
    expect(text).toContain('Festival data');
    expect(text).toContain('Custom festivals');
    expect(text).not.toContain('Choose a festival');
    expect(fixture.nativeElement.querySelector('.help-page__actions')).toBeNull();

    const gettingStartedToggle = fixture.nativeElement.querySelector(
      '[aria-controls="getting-started-content"]',
    ) as HTMLButtonElement;
    expect(gettingStartedToggle.getAttribute('aria-expanded')).toBe('false');

    gettingStartedToggle.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Choose a festival');
    expect(gettingStartedToggle.getAttribute('aria-expanded')).toBe('true');
  });
});
