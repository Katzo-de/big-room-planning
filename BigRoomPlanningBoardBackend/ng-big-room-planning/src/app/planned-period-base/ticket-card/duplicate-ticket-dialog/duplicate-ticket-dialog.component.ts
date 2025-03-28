import { Component, Inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { select, Store } from '@ngrx/store';
import { Sprint, Ticket } from '../../../client';
import { CreateEventService } from '../../../create-event.service';
import { first, map, Observable, switchMap } from 'rxjs';
import { getPlannedPeriods, getSprints } from '../../../store/app.selectors';
import create from '@kahmannf/iterable-transforms';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-duplicate-ticket-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    AsyncPipe
  ],
  templateUrl: './duplicate-ticket-dialog.component.html',
  styleUrl: './duplicate-ticket-dialog.component.scss',
})
export class DuplicateTicketDialogComponent implements OnInit {

  /**
   * Form group for the dialog.
   */
  formGroup = new FormGroup({
    ticketName: new FormControl('', Validators.required),
    sprintIds: new FormControl<number[]>([-1], Validators.required),
  });

  private sprintFilter$: Observable<Sprint[]>;
  sprintFilterValues$: Observable<Sprint[]>;


  constructor(
    private store$: Store<any>,
    private matDialogRef: MatDialogRef<DuplicateTicketDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Ticket,
    private createEventService: CreateEventService
  ) {}

  /**
   * The sprint filter observable.
   */
  ngOnInit(): void {

    this.formGroup.patchValue({
      ticketName: this.data.title,
    })

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

    this.sprintFilterValues$ = this.sprintFilter$.pipe(map(sprints => sprints.filter(x => x.sprintId !== (this.data.sprintId ?? -1))));


    this.sprintFilter$.pipe(first()).subscribe(sprints => {
      this.formGroup.patchValue({
        sprintIds: [sprints[sprints.indexOf(sprints.find(x => x.sprintId === this.data.sprintId)) + 1].sprintId]
      })
    })
  }

  createDuplicateTicket() {
    if (this.formGroup.invalid) {
      return;
    }
    this.formGroup.controls.sprintIds.value.forEach(sprintId => {
      this.createEventService.addTicket({
        ...this.data,
        title: this.formGroup.controls.ticketName.value,
        sprintId: sprintId,
        ticketId: -1
      });
    });
    this.cancel();
  }

  /**
   * Close the dialog.
   */
  cancel(): void {
    this.matDialogRef.close();
  }
}
