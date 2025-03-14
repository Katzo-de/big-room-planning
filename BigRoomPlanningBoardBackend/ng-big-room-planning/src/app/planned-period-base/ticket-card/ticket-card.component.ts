import {
  CdkContextMenuTrigger,
  CdkMenu,
  CdkMenuItem,
} from '@angular/cdk/menu';
import { AsyncPipe } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
} from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

import {
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';

import {
  select,
  Store,
} from '@ngrx/store';

import {
  IDependency,
  Ticket,
} from '../../client';
import { CreateEventService } from '../../create-event.service';
import {
  HighlightDependenciesService,
} from '../../highlight-dependencies.service';
import { SquadNamePipe } from '../../squad-name.pipe';
import {
  getDependencies,
  getSprints,
  getTickets,
} from '../../store/app.selectors';
import {
  EditTicketDialogComponent,
} from '../edit-ticket-dialog/edit-ticket-dialog.component';
import {
  AddDependencyDialogComponent,
} from './add-dependency-dialog/add-dependency-dialog.component';
import { CreateDependencyTicketComponent } from './create-dependency-ticket/create-dependency-ticket.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';

interface DependencyWithInfo extends IDependency {
  fullfilled: boolean;
}

@Component({
  selector: 'app-ticket-card',
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardContent,
    AsyncPipe,
    CdkMenu,
    CdkMenuItem,
    CdkContextMenuTrigger,
    MatIcon,
    SquadNamePipe,
    MatChipsModule,
    MatBadgeModule
  ],
  templateUrl: './ticket-card.component.html',
  styleUrl: './ticket-card.component.scss'
})
export class TicketCardComponent implements OnChanges {
  @Input()
  ticket: Ticket;

  @Input()
  mode: 'squad' | 'dependency';

  dependants$: Observable<DependencyWithInfo[]>;
  dependencies$: Observable<DependencyWithInfo[]>;
  dependenciesSameSprint$: Observable<DependencyWithInfo[]>;

  dependantsCount$: Observable<number>;
  dependantsFullfilled$: Observable<boolean>;

  dependenciesCount$: Observable<number>;
  dependenciesFullfilled$: Observable<boolean>;

  sameSprintCount$: Observable<number>;
  sameSprintFullfilled$: Observable<boolean>;

  isHighlightUnfullfilledDependency$: Observable<boolean> = of(false);
  isHighlightFullfilledDependency$: Observable<boolean> = of(false);

  isHighlightTarget$: Observable<boolean> = of(false);

  constructor(
    private matDialog: MatDialog,
    private createEventServie: CreateEventService,
    private store$: Store<any>,
    private highlightDependenciesService: HighlightDependenciesService
  ) {

  }


  ngOnChanges(simpleChanges: SimpleChanges) {

    if (simpleChanges['ticket']) {

      const sprintInfos$ = this.store$.pipe(
        select(getSprints),
        map(sprints => ({
          sprints,
          currentSprint: this.ticket.sprintId ? sprints.find(x => x.sprintId === this.ticket.sprintId) : null
        }))
      )

      const tickets$ = this.store$.pipe(
        select(getTickets)
      )

      this.dependants$ = this.store$.pipe(
        select(getDependencies),
        map(all => all.filter(x => x.dependencyTicketId === this.ticket.ticketId && !x.inSameSprint)),
        switchMap(dependants => tickets$.pipe(
          map(tickets => ({ tickets, dependants })),
          switchMap(infos => sprintInfos$.pipe(
            map(sprintInfos => ({...sprintInfos, ...infos}))
          ))
        )),
        map(({ currentSprint, dependants, sprints, tickets }) => dependants.map(dependant => {

          let fullfilled = false;

          const dependantTicket = tickets.find(x => x.ticketId === dependant.dependantTicketId)

          const targetSprint = dependantTicket.sprintId ? sprints.find(s => s.sprintId === dependantTicket.sprintId) : null

          if (!targetSprint) {
            fullfilled = true;
          } else if (!currentSprint) {
            fullfilled = false;
          } else {
            fullfilled = currentSprint.sprintId !== targetSprint.sprintId && currentSprint.endsAt.getTime() < targetSprint.startsAt.getTime();
          }

          return {
            ...dependant,
            fullfilled
          }
        }))
      );

      this.dependencies$ = this.store$.pipe(
        select(getDependencies),
        map(all => all.filter(x => x.dependantTicketId === this.ticket.ticketId && !x.inSameSprint)),
        switchMap(dependencies => tickets$.pipe(
          map(tickets => ({ tickets, dependencies })),
          switchMap(infos => sprintInfos$.pipe(
            map(sprintInfos => ({...sprintInfos, ...infos}))
          ))
        )),
        map(({ currentSprint, dependencies, sprints, tickets }) => dependencies.map(dependency => {

          let fullfilled = false;

          const dependencyTicket = tickets.find(x => x.ticketId === dependency.dependencyTicketId)

          const previousSprint = dependencyTicket.sprintId ? sprints.find(s => s.sprintId === dependencyTicket.sprintId) : null
          
          if (!currentSprint) {
            fullfilled = true;
          } else if (!previousSprint) {
            fullfilled = false;
          } else {
            fullfilled = currentSprint.sprintId !== previousSprint.sprintId && previousSprint.endsAt.getTime() < currentSprint.startsAt.getTime();
          }

          return {
            ...dependency,
            fullfilled
          }
        }))
      );

      this.dependenciesSameSprint$ = this.store$.pipe(
        select(getDependencies),
        map(all => all.filter(ticket => 
          (ticket.dependantTicketId === this.ticket.ticketId 
          || ticket.dependencyTicketId === this.ticket.ticketId)
          && ticket.inSameSprint
        )),
         switchMap(dependenciesSameSprint => tickets$.pipe(
          map(tickets => ({ tickets, dependenciesSameSprint })),
          switchMap(infos => sprintInfos$.pipe(
            map(sprintInfos => ({...sprintInfos, ...infos}))
          ))
        )),
        map(({ currentSprint, dependenciesSameSprint, sprints, tickets }) => dependenciesSameSprint.map(dependenciesSameSprint => {
          let fullfilled = false;

          const dependencyTicket = tickets.find(x => x.ticketId === dependenciesSameSprint.dependencyTicketId)

          const previousSprint = dependencyTicket.sprintId ? sprints.find(s => s.sprintId === dependencyTicket.sprintId) : null
          
          const dependantTicket = tickets.find(x => x.ticketId === dependenciesSameSprint.dependantTicketId)

          const targetSprint = dependantTicket.sprintId ? sprints.find(s => s.sprintId === dependantTicket.sprintId) : null

          fullfilled = currentSprint && targetSprint && previousSprint ? 
            currentSprint.sprintId === targetSprint.sprintId && currentSprint.sprintId === previousSprint.sprintId : 
            currentSprint === targetSprint && currentSprint === previousSprint; 

          return {
            ...dependenciesSameSprint,
            fullfilled
          }
        }))
      );

      this.dependantsCount$ = this.dependants$.pipe(map(x => x.length));
      this.dependantsFullfilled$ = this.dependants$.pipe(map(x => x.length === 0 ? true : x.every(y => y.fullfilled)));
      this.dependenciesCount$ = this.dependencies$.pipe(map(x => x.length));
      this.dependenciesFullfilled$ = this.dependencies$.pipe(map(x => x.length === 0 ? true : x.every(y => y.fullfilled)));
      this.sameSprintCount$ = this.dependenciesSameSprint$.pipe(map(x => x.length));
      this.sameSprintFullfilled$ = this.dependenciesSameSprint$.pipe(map(x => x.length === 0 ? true : x.every(y => y.fullfilled)));
    }

    if(simpleChanges['mode'] || simpleChanges['ticket']) {
      if (this.mode === 'squad') {
        this.isHighlightFullfilledDependency$ = of(false);
        this.isHighlightUnfullfilledDependency$ = of(false);
        this.isHighlightTarget$ = of(false);
      } else {

        const allDeps$: Observable<DependencyWithInfo[]> = combineLatest([
          this.dependants$,
          this.dependencies$,
          this.dependenciesSameSprint$
        ]).pipe(
          map(([a, b, c]) => ([...a, ...b, ...c]))
        );

        this.isHighlightUnfullfilledDependency$ = combineLatest([
          allDeps$,
          this.highlightDependenciesService.highlightedDependencyIds$
        ]).pipe(
          map(([deps, highlightIds]) =>
            !highlightIds?.length
              ? false
              : deps.some(x => !x.fullfilled && highlightIds.includes(x.dependencyId))
          )
        );

        this.isHighlightFullfilledDependency$ = combineLatest([
          allDeps$,
          this.highlightDependenciesService.highlightedDependencyIds$
        ]).pipe(
          map(([deps, highlightIds]) => ({
            deps: !highlightIds?.length? [] : deps.filter(x => highlightIds.includes(x.dependencyId)),
            highlightIds
          })),
          map(({ deps, highlightIds }) =>
            !highlightIds?.length
              ? false
              : (
                deps.length > 0
                && deps.every(x => x.fullfilled)
              ) 
          )
        );
      }

    }
  }

  edit() {
    this.matDialog.open(EditTicketDialogComponent, {
      data: this.ticket,
      disableClose: true
    })
  }

  addDependency() {
    this.matDialog.open(AddDependencyDialogComponent, {
      height: '90vh',
      maxHeight: '90vh',
      width: '60rem',
      maxWidth: '60vw',
      data: this.ticket,
      disableClose: true
    });
  }


  createDependencyTicket() {
    this.matDialog.open(CreateDependencyTicketComponent, {
      width: '40rem',
      maxWidth: '60vw',
      data: this.ticket,
      disableClose: true
    })
  }

  delete() {
    this.createEventServie.deleteTicket(this.ticket.ticketId);
  }

  mouseEnter() {
    if(this.mode === 'dependency') {
      this.highlightDependenciesService.mouseEnter(this.ticket);
    }
  }

  mouseLeave() {
    if(this.mode === 'dependency') {
      this.highlightDependenciesService.mouseLeave();
    }
  }
}
