import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FestivalDraft } from '../../../core/festivals/models/festival-draft';
import { Festival } from '../../../core/festivals/models/festival';
import { FestivalFormComponent } from './festival-form.component';

describe('FestivalFormComponent', () => {
  let component: FestivalFormComponent;
  let fixture: ComponentFixture<FestivalFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FestivalFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FestivalFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('blocks submission when required values are missing', () => {
    const savedFestivals: FestivalDraft[] = [];
    component.saved.subscribe((festival) => savedFestivals.push(festival));

    component.submit();

    expect(component.form.invalid).toBeTrue();
    expect(savedFestivals).toEqual([]);
  });

  it('blocks submission when the end date is before the start date', () => {
    component.form.setValue({
      title: 'Sunset Fields',
      location: 'Somerset',
      startDate: '2026-08-16',
      endDate: '2026-08-14',
      imageUrl: '',
      transportArranged: true,
    });

    component.submit();

    expect(component.form.hasError('endDateBeforeStartDate')).toBeTrue();
  });

  it('emits a typed festival draft for a valid submission', () => {
    const savedFestivals: FestivalDraft[] = [];
    component.saved.subscribe((festival) => savedFestivals.push(festival));
    component.form.setValue({
      title: ' Sunset Fields ',
      location: ' Somerset ',
      startDate: '2026-08-14',
      endDate: '2026-08-16',
      imageUrl: ' https://example.com/festival.jpg ',
      transportArranged: true,
    });

    component.submit();

    expect(savedFestivals).toEqual([
      {
        title: 'Sunset Fields',
        location: 'Somerset',
        startDate: '2026-08-14',
        endDate: '2026-08-16',
        imageUrl: 'https://example.com/festival.jpg',
        transportArranged: true,
      },
    ]);
  });

  it('populates controls when a festival is supplied for editing', () => {
    const festival: Festival = {
      id: 'festival-id',
      title: 'Sunset Fields',
      startDate: '2026-08-14',
      endDate: '2026-08-16',
      imageUrl: 'https://example.com/festival.jpg',
      location: 'Somerset',
      transportArranged: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    fixture.componentRef.setInput('festival', festival);
    fixture.detectChanges();

    expect(component.form.getRawValue()).toEqual({
      title: festival.title,
      startDate: festival.startDate,
      endDate: festival.endDate,
      imageUrl: festival.imageUrl ?? '',
      location: festival.location,
      transportArranged: festival.transportArranged,
    });
  });
});
