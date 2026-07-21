import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';
import { FESTIVAL_REPOSITORY } from './core/festivals/data/festival-repository.token';
import { FestivalRepository } from './core/festivals/data/festival.repository';

const emptyFestivalRepository: FestivalRepository = {
  getAll: async () => [],
  create: async () => undefined,
  update: async () => undefined,
  delete: async () => undefined,
};

describe('AppComponent', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: FESTIVAL_REPOSITORY, useValue: emptyFestivalRepository },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});
