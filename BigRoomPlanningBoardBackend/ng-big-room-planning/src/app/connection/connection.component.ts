import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConnectionLostComponent } from './connection-lost/connection-lost.component';
import { CreateConnectionComponent } from './create-connection/create-connection.component';
import { ConnectionService } from './connection.service';
import {
  ProgressBarMode,
  MatProgressBarModule,
} from '@angular/material/progress-bar';
import { select, Store } from '@ngrx/store';
import {
  getConnectionError,
  getCurrentSession,
  getIsConnected,
} from '../store/app.selectors';
import { Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-connection',
  standalone: true,
  imports: [
    ConnectionLostComponent,
    CreateConnectionComponent,
    MatProgressBarModule,
    RouterModule,
    AsyncPipe,
  ],
  templateUrl: './connection.component.html',
  styleUrl: './connection.component.scss',
})
export class ConnectionComponent {
  private store$ = inject(Store);

  progressBarMode: ProgressBarMode = 'indeterminate';

  currentSession$ = this.store$.pipe(select(getCurrentSession));
  isConnected$ = this.store$.pipe(select(getIsConnected));
  connectionError$ = this.store$.pipe(select(getConnectionError));
}
