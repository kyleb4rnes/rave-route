import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FESTIVAL_REPOSITORY } from '../core/festivals/data/festival-repository.token';
import { FestivalRepository } from '../core/festivals/data/festival.repository';
import { FestivalDraft } from '../core/festivals/models/festival-draft';
import { HomePage } from './home.page';

const emptyFestivalRepository: FestivalRepository = {
  getAll: async () => [],
  create: async () => undefined,
  update: async () => undefined,
  delete: async () => undefined,
};

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        { provide: FESTIVAL_REPOSITORY, useValue: emptyFestivalRepository },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closes the add festival experience after creating a festival', async () => {
    const festivalDraft: FestivalDraft = {
      title: 'Created Festival',
      startDate: '2026-08-01',
      endDate: '2026-08-03',
      location: 'Bristol',
      transportArranged: false,
    };

    component.openAddFestivalForm();
    await component.createFestival(festivalDraft);

    expect(component.isAddFestivalFormOpen()).toBeFalse();
  });
});
