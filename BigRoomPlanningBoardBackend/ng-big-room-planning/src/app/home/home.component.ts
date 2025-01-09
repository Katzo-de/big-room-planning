import {
  AsyncPipe,
  NgFor,
} from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { 
  MatButton, 
  MatButtonModule 
} from '@angular/material/button';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
} from '@angular/material/card';
import {
  MatChip,
  MatChipSet,
} from '@angular/material/chips';
import { RouterLink } from '@angular/router';

import {
  map,
  Observable,
} from 'rxjs';

import create from '@kahmannf/iterable-transforms';
import {
  select,
  Store,
} from '@ngrx/store';

import {
  PlannedPeriod,
  Session,
} from '../client';
import { PeriodNamePipe } from '../pipes/period-name.pipe';
import {
  getCurrentSession,
  getPlannedPeriods,
} from '../store/app.selectors';
import {
  MatMenuModule
} from '@angular/material/menu';
import {
  MatIconModule
} from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    AsyncPipe,
    NgFor,
    MatCard,
    MatChipSet,
    MatChip,
    MatCardHeader,
    MatCardContent,
    MatCardFooter,
    MatCardActions,
    PeriodNamePipe,
    RouterLink,
    MatButton,
    MatButtonModule,
    MatMenuModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  session$: Observable<Session>;

  hasNoPeriods$: Observable<boolean>; 

  periods$: Observable<PlannedPeriod[]>; 

  constructor (
    private store$: Store<any>
  ) {

  }

  ngOnInit(): void {
    this.session$ = this.store$.pipe(
      select(getCurrentSession)
    );

    this.periods$ = this.store$.pipe(
      select(getPlannedPeriods),
      map(periods => {
        return create(periods).sort(x => x.startDay.getTime(), 'desc').toArray()
      })
    );

    this.hasNoPeriods$ = this.periods$.pipe(
      map(x => !x?.length)
    );
  }
  

  changeTheme(theme: 'light'| 'dark' | 'system') {
    localStorage.setItem('theme', theme)

    // Duplicate code 1
    const mode = localStorage.getItem('theme') === 'dark' || 
      ((!('theme' in localStorage) || localStorage.getItem('theme') === 'system') 
        && window.matchMedia('(prefers-color-scheme: dark)').matches)

    document.documentElement.setAttribute('data-theme', mode ? 'dark' : 'light');
  }

}
