import { Component, OnInit } from '@angular/core';
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
import { Observable, Subscription } from 'rxjs';
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

  currentSession$: Observable<any>;
  isConnected$: Observable<any>;
  connectionError$: Observable<any>;
  
  progressBarMode: ProgressBarMode = 'indeterminate';

  constructor(
    private store$: Store<any>
  ) {
    this.currentSession$ = this.store$.pipe(select(getCurrentSession));
    this.isConnected$ = this.store$.pipe(select(getIsConnected));
    this.connectionError$ = this.store$.pipe(select(getConnectionError));
  }
  

}
