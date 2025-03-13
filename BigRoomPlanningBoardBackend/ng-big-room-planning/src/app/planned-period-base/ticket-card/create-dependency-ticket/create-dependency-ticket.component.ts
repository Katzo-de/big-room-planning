import { Component, Inject, OnDestroy, OnInit, signal } from '@angular/core';
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
import { select, Store } from '@ngrx/store';
import { map, Subscription } from 'rxjs';
import { Squad, Ticket } from '../../../client';
import { getSquads } from '../../../store/app.selectors';
import create from '@kahmannf/iterable-transforms';
import { SquadNamePipe } from '../../../squad-name.pipe';
import { CreateEventService } from '../../../create-event.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { NgFor } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-create-dependency-ticket',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIcon,
    NgFor,
    MatButtonToggleModule,
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './create-dependency-ticket.component.html',
  styleUrl: './create-dependency-ticket.component.scss',
})
export class CreateDependencyTicketComponent implements OnInit, OnDestroy {
  squads = signal<Squad[]>([]);

  formGroup = new FormGroup({
    title: new FormControl<string>(null, Validators.required),
    squad: new FormControl<number>(null, Validators.required),
    dependencyType: new FormControl<'dependency' | 'dependant' | 'chained'>(
      null,
      Validators.required
    ),
  });

  private subscription: Subscription;
  private squadNamePipe: SquadNamePipe;

  constructor(
    private store$: Store<any>,
    private matDialogRef: MatDialogRef<CreateDependencyTicketComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Ticket,
    private createEventService: CreateEventService
  ) {
    this.subscription = new Subscription();
    this.squadNamePipe = new SquadNamePipe(this.store$);

    this.subscription.add(
      this.store$
        .pipe(
          select(getSquads),
          map((squads) =>
            create(squads)
              .filter((s) => s.squadId !== this.data.squadId)
              .sort((s) => s.name)
              .toArray()
          )
        )
        .subscribe((squads) => {
          this.squads.set(squads);
        })
    );
    this.subscription.add(
      this.squadNamePipe.transform(this.data.squadId).subscribe((squadName) => {
        this.formGroup.patchValue({
          title: '[' + squadName + '] ' + this.data.title,
        });
      })
    );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  createDependencyTicket(): void {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {
      this.createEventService.addDependencyTicket(
        {
          columnOrder: 0,
          plannedPeriodId: this.data.plannedPeriodId,
          predecessorId: undefined,
          sprintId: undefined,
          squadId: this.formGroup.value.squad,
          title: this.formGroup.value.title,
        },
        {
          dependantTicketId:this.formGroup.value.dependencyType === 'dependant'
            ? this.data.ticketId
            : this.formGroup.value.dependencyType === 'chained' 
              ? this.data.ticketId
              : undefined,
          dependencyTicketId: this.formGroup.value.dependencyType === 'dependency'
            ? this.data.ticketId
            : undefined,
          inSameSprint: this.formGroup.value.dependencyType === 'chained'
        }
      );
      this.matDialogRef.close();
    }
  }

  cancel(): void {
    this.matDialogRef.close();
  }

  getDependencyTooltip() {
    return $localize`"${this.formGroup.value.title}" has to be completed before "${this.data.title}"`;
  }

  getDependantTooltip() {
    return $localize`"${this.formGroup.value.title}" can only be started, after "${this.data.title}" is complete`
  }

  getSameSprintTooltip() {
    return $localize`"${this.formGroup.value.title}" and "${this.data.title}" have to be completed in the same sprint`;
  }
}
