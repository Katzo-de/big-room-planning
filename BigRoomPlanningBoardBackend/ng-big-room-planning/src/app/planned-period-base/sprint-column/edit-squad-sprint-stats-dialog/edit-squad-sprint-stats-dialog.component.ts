import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  MatSlider,
  MatSliderThumb,
} from '@angular/material/slider';

import { ISquadSprintStats } from '../../../client';
import { CreateEventService } from '../../../create-event.service';
import {
  MatFormFieldModule
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-edit-squad-sprint-stats-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatSlider,
    MatSliderThumb,
    ReactiveFormsModule,
    MatButton,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './edit-squad-sprint-stats-dialog.component.html',
  styleUrl: './edit-squad-sprint-stats-dialog.component.scss'
})
export class EditSquadSprintStatsDialogComponent implements OnInit {

  formGroup = new FormGroup({
    capacity: new FormControl<number>(0),
    backgroundNoise: new FormControl<number>(0),
    note: new FormControl<string>(''),
  })

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: ISquadSprintStats,
    private matDialogRef: MatDialogRef<EditSquadSprintStatsDialogComponent>,
    private createEventService: CreateEventService
  ) {
    this.formGroup.controls.backgroundNoise.valueChanges.subscribe(value => {
      this.formGroup.controls.backgroundNoise.setValue(value, { emitEvent: false });
    });
    this.formGroup.controls.capacity.valueChanges.subscribe(value => {
      this.formGroup.controls.capacity.setValue(value, { emitEvent: false });
    });
  }

  ngOnInit(): void {
    this.formGroup.setValue({
      backgroundNoise: this.data.backgroundNoise,
      capacity: this.data.capacity,
      note: this.data.note
    });
  }

  saveClick () {
    this.createEventService.addOrUpdateSquadSprintStats({
      ...this.data,
      capacity: this.formGroup.controls.capacity.value,
      backgroundNoise: this.formGroup.controls.backgroundNoise.value,
      note: this.formGroup.controls.note.value
    });

    this.matDialogRef.close();
  }

  cancelClick () {
    this.matDialogRef.close();
  }

  formatLabel(value: number): string {
    return `${value}%`;
  }

}
