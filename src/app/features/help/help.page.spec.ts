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

  it('shows the onboarding steps and navigation actions', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Getting started');
    expect(text).toContain('Add a festival');
    expect(text).toContain('Build your route');
    expect(text).toContain('Keep plans close');
    expect(text).toContain('Browse festivals');
  });
});
