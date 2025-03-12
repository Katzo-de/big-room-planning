import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import {
  first,
  map,
  Subscription,
} from 'rxjs';

import {
  select,
  Store,
} from '@ngrx/store';

import {
  IPlannedPeriod,
  PlannedPeriod,
} from '../client';
import { CreateEventService } from '../create-event.service';
import {
  EditEntityComponent,
  EditEntityPageComponent,
} from '../edit-entity-page/edit-entity-page.component';
import { HandleErrorService } from '../handle-error.service';
import { getPlannedPeriods } from '../store/app.selectors';

@Component({
  selector: 'app-create-planned-period',
  standalone: true,
  imports: [
    EditEntityPageComponent,
    ReactiveFormsModule,
    MatInput,
    MatFormFieldModule,
    MatDatepickerModule
  ],
  providers: [
    {
      provide: EditEntityComponent,
      useExisting: EditPlannedPeriodComponent
    }
  ],
  templateUrl: './edit-planned-period.component.html',
  styleUrl: './edit-planned-period.component.scss'
})
export class EditPlannedPeriodComponent extends EditEntityComponent implements OnInit, OnDestroy {

  editId?: number;

  formGroup = new FormGroup({
    name: new FormControl<string>(null, Validators.required),
    startDay: new FormControl<Date>(null, Validators.required),
    endDay: new FormControl<Date>(null, Validators.required),
    bigRoomPlanningAt: new FormControl<Date>(null)
  })

  isInitialized = false;

  isNew = false;

  title = '';

  isTimeRangeValid = true;

  ngSubmitCallback: () => void = () => {};

  private subscription: Subscription;

  private allOtherPlannedPeriods: PlannedPeriod[];
  private allOtherPlannedPeriodsSubscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private store$: Store<any>,
    private handleErrorService: HandleErrorService,
    private createEventServie: CreateEventService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscription = new Subscription();

    this.subscription.add(this.formGroup.controls.startDay.valueChanges.subscribe(() => this.updateTimeRangeValid()));
    this.subscription.add(this.formGroup.controls.endDay.valueChanges.subscribe(() => this.updateTimeRangeValid()));
    
    this.subscription.add(
      this.activatedRoute.params.subscribe(params => {
        let id: string | number = params['id'];

        if (typeof id === 'undefined') {

          this.isNew = true;
          this.title = $localize`Create new Planned Period`;

          this.isInitialized = true;
          this.subscribeToOtherPeriods();
          return;
        }


        if (typeof id !== 'number') {
          let original = id;
          id = parseInt(id, 10);

          if (Number.isNaN(id)) {
            this.handleErrorService.handleError($localize`Invalid id ${original}`);
            history.back();
            return;
          }
        }

        this.store$.pipe(
          select(getPlannedPeriods),
          first(),
        ).subscribe(periods => {

          const target = periods.find(x => x.plannedPeriodId === id);

          if(!target) {
            this.handleErrorService.handleError($localize`Could not find Plannned Period with id ${id}`);
            history.back();
          } else {
            this.editId = target.plannedPeriodId;
            this.formGroup.setValue({
              bigRoomPlanningAt: target.bigRoomPlanningAt ?? null,
              endDay: target.endDay ?? null,
              name: target.name ?? null,
              startDay: target.startDay ?? null
            });
            this.isInitialized = true;
            this.subscribeToOtherPeriods();
          }
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.allOtherPlannedPeriodsSubscription?.unsubscribe()
  }


  override checkValidAndTouch(): boolean {
    this.formGroup.markAllAsTouched();

    return this.formGroup.valid
      && this.isTimeRangeValid
      && this.formGroup.controls.startDay.value.getTime() < this.formGroup.controls.endDay.value.getTime();
  }

  override saveAndClose(): void {
    
    const result: IPlannedPeriod = {
      bigRoomPlanningAt: this.formGroup.controls.bigRoomPlanningAt.value,
      endDay: this.formGroup.controls.endDay.value,
      name: this.formGroup.controls.name.value,
      startDay: this.formGroup.controls.startDay.value,
      plannedPeriodId: this.editId
    }

    if(this.isNew) {
      this.createEventServie.addPlannedPeriod(result);
    } else {
      this.createEventServie.editPlannedPeriod(result);
    }

  }

  override registerOnSubmitCallback(callback: () => void): void {
    this.ngSubmitCallback = callback;
  }

  ngSubmit() {
    this.ngSubmitCallback();
  }

  private subscribeToOtherPeriods() {
    this.allOtherPlannedPeriodsSubscription?.unsubscribe();

    this.allOtherPlannedPeriodsSubscription = this.store$.pipe(
      select(getPlannedPeriods),
      map(periods => periods.filter(x => x.plannedPeriodId !== this.editId))
    ).subscribe(periods => {
      this.allOtherPlannedPeriods = periods;
      this.updateTimeRangeValid();
    })
  }

  private updateTimeRangeValid() {
    const startsAtTime = this.formGroup.controls.startDay.value?.getTime();
    const endsAtTime = this.formGroup.controls.endDay.value?.getTime();

    this.isTimeRangeValid =
      !this.allOtherPlannedPeriods?.length
      || !startsAtTime
      || !endsAtTime
      || !this.allOtherPlannedPeriods.some(x => 
        (startsAtTime <= x.startDay.getTime() && endsAtTime >=  x.startDay.getTime())
        || (startsAtTime <= x.endDay.getTime() && endsAtTime >= x.endDay.getTime())
        || (startsAtTime <= x.startDay.getTime() && endsAtTime >= x.endDay.getTime())
        || (startsAtTime >= x.startDay.getTime() && endsAtTime <= x.endDay.getTime())
      )
  }
}
