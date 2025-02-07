import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CreateEventService } from '../../create-event.service';

@Component({
  selector: 'app-create-connection',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './create-connection.component.html',
  styleUrl: './create-connection.component.scss',
})
export class CreateConnectionComponent {
  
  submitted = false;

  formGroup = new FormGroup({
    name: new FormControl<string>(null, Validators.required),
  });

  constructor(
    private createEventService: CreateEventService
  ) {}

  createSession(): void {
    this.formGroup.markAllAsTouched();

    if (!this.formGroup.valid && !this.submitted) return;
    this.createEventService.startSession(this.formGroup.controls.name.value);
    this.submitted = true;
  }
}
