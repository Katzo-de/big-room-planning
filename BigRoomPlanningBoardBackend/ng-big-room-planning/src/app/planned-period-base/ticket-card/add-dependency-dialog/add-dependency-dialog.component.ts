import {
  AsyncPipe,
} from '@angular/common';
import {
  Component,
  Inject,
  NgZone,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatButton,
  MatIconButton,
} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';

import {
  first,
  map,
  Observable,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

import create from '@kahmannf/iterable-transforms';
import {
  select,
  Store,
} from '@ngrx/store';

import {
  ITicket,
  Sprint,
  Squad,
  Ticket,
} from '../../../client';
import { CreateEventService } from '../../../create-event.service';
import { IterationNamePipe } from '../../../iteration-name.pipe';
import {
  getDependencies,
  getPlannedPeriods,
  getSprints,
  getSquads,
  getTickets,
} from '../../../store/app.selectors';
import { 
  SquadNamePipe 
} from '../../../squad-name.pipe';
import {
  MatChipsModule 
} from '@angular/material/chips';
import {
  MatDividerModule
} from '@angular/material/divider';
import { CreateDependencyTicketComponent } from '../create-dependency-ticket/create-dependency-ticket.component';
import {
  MatButtonToggleModule
} from '@angular/material/button-toggle';

interface TicketWithDetails extends ITicket {
  dependencyType: 'dependency' | 'dependant' | 'none';
  inSameSprint?: boolean;
  /**
   * Determines if that dependency is fullfilled or critical
   */
  fullfilled?: boolean;
  dependencyId?: number;
}

@Component({
  selector: 'app-add-dependency-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatButton,
    MatInput,
    MatSelectModule,
    MatFormFieldModule,
    MatIconButton,
    MatIcon,
    MatTooltip,
    IterationNamePipe,
    SquadNamePipe,
    MatChipsModule,
    MatDividerModule,
    MatButtonToggleModule
  ],
  templateUrl: './add-dependency-dialog.component.html',
  styleUrl: './add-dependency-dialog.component.scss'
})
export class AddDependencyDialogComponent implements OnInit {
  
  formGroup = new FormGroup({
    squad: new FormControl<number>(null),
    sprints: new FormControl<number[]>(null),
    title: new FormControl<string>(null)
  });

  squadFilter$: Observable<Squad[]>;

  sprintFilter$: Observable<Sprint[]>;

  ticketList$: Observable<TicketWithDetails[]>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Ticket,
    private store$: Store<any>,
    private matDialogRef: MatDialogRef<AddDependencyDialogComponent>,
    private ngZone: NgZone,
    private createEventService: CreateEventService,
    private matDialog: MatDialog
  ) { }

  ngOnInit() {
    this.squadFilter$ = this.store$.pipe(
      select(getSquads),
      map(squads => create(squads)
        .filter(s => s.squadId !== this.data.squadId)
        .sort(s => s.name)
        .toArray()
      )
    );

    const plannedPeriod$ = this.store$.pipe(
      select(getPlannedPeriods),
      map(periods => periods.find(x => x.plannedPeriodId === this.data.plannedPeriodId))
    )

    this.sprintFilter$ = this.store$.pipe(
      select(getSprints),
      switchMap(sprints => plannedPeriod$.pipe(
        map(plannedPeriod => ({ sprints, plannedPeriod }))
      )),
      map(({ sprints, plannedPeriod }) => create(sprints)
        .filter(x => x.endsAt.getTime() >= plannedPeriod.startDay.getTime() && x.endsAt.getTime() <= plannedPeriod.endDay.getTime())
        .sort(x => x.name)
        .toArray()
      ),
      map(sprints => ([
        new Sprint({
          name: $localize`Backlog`,
          sprintId: -1
        }),
        ...sprints
      ]))
    );

    this.sprintFilter$.pipe(
      first(),
      switchMap(val => new Observable<Sprint[]>((subscriber) => {
        setTimeout(() => {
          subscriber.next(val);
          subscriber.complete();
        }, 0);
      }))
    ).subscribe(sprints => this.ngZone.run(() => this.formGroup.patchValue({
      sprints: sprints.map(x => x.sprintId)
    })));

    const dependencyInfos$ = this.store$.pipe(
      select(getDependencies),
      map(dependencies => ({
        dependantConnections: dependencies.filter(x => x.dependantTicketId === this.data.ticketId),
        dependencyConnections: dependencies.filter(x => x.dependencyTicketId === this.data.ticketId),
      }))
    )

    this.ticketList$ = this.formGroup.valueChanges.pipe(
      startWith({}),
      switchMap(filter => this.store$.pipe(
        select(getTickets),
        tap(x => console.log('selector', x)),
        switchMap(tickets => dependencyInfos$.pipe(
          map((infos) => ({ ...infos, tickets }))
        )),
        switchMap(infos => this.sprintFilter$.pipe(
          map(sprints => ({...infos, sprints}))
        )),
        map(({ tickets, dependantConnections, dependencyConnections, sprints }) => create(tickets)
          .filter(ticket => ticket.plannedPeriodId === this.data.plannedPeriodId
            && ticket.squadId !== this.data.squadId
            && this.checkFilter(ticket, filter)
          )
          .map(ticket => {

            const dependantConnection = dependantConnections.find(x => x.dependencyTicketId === ticket.ticketId);

            if (dependantConnection) {

              let fullfilled = false;

              if (!this.data.sprintId) {
                fullfilled = true;
              } else if (!ticket.sprintId) {
                fullfilled = false;
              } else {
                const dependencySprint = sprints.find(s => s.sprintId === ticket.sprintId);
                const dependantSprint = sprints.find(s => s.sprintId === this.data.sprintId);

                if (dependantConnection.inSameSprint) {
                  fullfilled = dependencySprint.sprintId === dependantSprint.sprintId
                } else {
                  fullfilled = dependencySprint.sprintId !== dependantSprint.sprintId && dependencySprint.endsAt.getTime() < dependantSprint.startsAt.getTime();
                }
              }
              
              const result: TicketWithDetails = {
                ...ticket,
                dependencyType: 'dependant',
                inSameSprint: dependantConnection.inSameSprint,
                dependencyId: dependantConnection.dependencyId,
                fullfilled
              };

              return result;
            }

            const dependencyConenction = dependencyConnections.find(x => x.dependantTicketId === ticket.ticketId);

            if (dependencyConenction) {
              
              let fullfilled = false;

              if (!ticket.sprintId) {
                fullfilled = true;
              } else if (!this.data.sprintId) {
                fullfilled = false;
              } else {
                const dependencySprint = sprints.find(s => s.sprintId === this.data.sprintId);
                const dependantSprint = sprints.find(s => s.sprintId === ticket.sprintId);

                if (dependencyConenction.inSameSprint) {
                  fullfilled = dependantSprint.sprintId === dependencySprint.sprintId;
                } else {
                  fullfilled = dependantSprint.sprintId !== dependencySprint.sprintId && dependencySprint.endsAt.getTime() < dependantSprint.startsAt.getTime();
                }
              }

              const result: TicketWithDetails = {
                ...ticket,
                dependencyType: 'dependency',
                inSameSprint: dependencyConenction.inSameSprint,
                dependencyId: dependencyConenction.dependencyId,
                fullfilled
              };

              return result;
            }

            const noneTicket: TicketWithDetails = {
              ...ticket,
              dependencyType: 'none'
            };

            return noneTicket;
          })
          .sort(x => x.dependencyType === 'dependant' ? 0 : x.dependencyType === 'dependency' ? 1 : 2)
          .thenSort(x => x.title)
          .toArray()
        )
      ))
    )
  }

  close() {
    this.matDialogRef.close();
  }

  clearSquadSelection(event: MouseEvent) {
    event.stopImmediatePropagation();
    event.preventDefault();
    this.formGroup.patchValue({ squad: null })
  }

  getDependencyTooltip(ticket: ITicket) {
    return $localize`"${ticket.title}" has to be completed before "${this.data.title}"`;
  }

  getDependantTooltip(ticket: ITicket) {
    return $localize`"${ticket.title}" can only be started, after "${this.data.title}" is complete`
  }

  getSameSprintTooltip(ticket: ITicket) {
    return $localize`"${ticket.title}" and "${this.data.title}" have to be completed in the same sprint`;
  }

  addDependency(ticket: TicketWithDetails, type: "dependency" | "dependant" | "sameSprint" | "none") {
    switch (type) {
      case 'dependant':
        if (ticket.dependencyType == 'dependency') return;
        this.createEventService.addDependency({
          dependencyTicketId: this.data.ticketId,
          inSameSprint: false,
          dependantTicketId: ticket.ticketId
        });
        ticket.dependencyType = 'dependant';
        break;
      case 'dependency':
        if (ticket.dependencyType == 'dependant') return;
        this.createEventService.addDependency({
          dependencyTicketId: ticket.ticketId,
          inSameSprint: false,
          dependantTicketId: this.data.ticketId
        });
        ticket.dependencyType = 'dependency';
        break;
      case 'sameSprint':
        if (ticket.inSameSprint) return;
        this.createEventService.addDependency({
          dependencyTicketId: ticket.ticketId,
          inSameSprint: true,
          dependantTicketId: this.data.ticketId
        });
        ticket.inSameSprint = true;
        break;
      default:
      case 'none':
        break;
    }
  }

  deleteDependency(dependencyId: number) {
    this.createEventService.deleteDependency({
      dependencyId
    });
  }

  createDependencyTicket() {
    this.matDialogRef.close();
    this.matDialog.open(CreateDependencyTicketComponent, {
      width: '40rem',
      maxWidth: '60vw',
      data: this.data,
      disableClose: true
    })
  }

  private checkFilter(ticket: Ticket, filter: Partial<{ squad: number, sprints: number[], title: string }>): boolean {

    if (filter.title && !ticket.title.toLowerCase().includes(filter.title.toLowerCase())) {
      return false;
    }

    if (typeof filter.squad === 'number' && filter.squad !== ticket.squadId) {
      return false;
    }

    if (!filter.sprints || filter.sprints.length === 0) {
      return false;
    }

    const sprintFilter = filter.sprints.map(x => x === -1 ? null : x);

    if(!sprintFilter.includes(ticket.sprintId)) {
      return false;
    }

    return true;
  }
}
