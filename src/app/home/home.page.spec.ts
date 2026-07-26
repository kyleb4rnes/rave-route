import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { FESTIVAL_REPOSITORY } from '../core/festivals/data/festival-repository.token';
import { FestivalRepository } from '../core/festivals/data/festival.repository';
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

  it('opens the dedicated add festival page', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    component.openAddFestivalForm();

    expect(router.navigate).toHaveBeenCalledWith(['/festivals/add']);
  });
});
