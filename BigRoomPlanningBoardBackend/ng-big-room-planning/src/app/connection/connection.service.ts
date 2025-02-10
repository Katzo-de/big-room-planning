import { Injectable } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from '@microsoft/signalr';
import { select, Store } from '@ngrx/store';
import { connectionStateChange, setCurrentSession } from '../store/app.actions';
import { Router } from '@angular/router';
import { IBRPFullData, IEvent, ISession, Session } from '../client';
import { Subscription } from 'rxjs';
import { getCurrentSession } from '../store/app.selectors';
import { MatSnackBar } from '@angular/material/snack-bar';

const enableLogging: boolean = true;

@Injectable({
  providedIn: 'root',
})
export class ConnectionService {
  private _connection: HubConnection;
  private readonly connectionUrl: string = '/hubs/data';
  private readonly localStorageItemKey: string = 'session';

  private _activeSessionId: string;
  get activeSessionId(): string {
    return this.activeSession?.sessionId ?? this._activeSessionId;
  }
  set activeSessionId(value: string) {
    this._activeSessionId = value;
  }

  private activeSession: Session;

  private _onRecieveEvents = (events) => {};

  private _onRecieveFullData = (data) => {};

  constructor(
    private store$: Store<any>,
    private snackBar: MatSnackBar,
  ) {
    this._connection = new HubConnectionBuilder()
      .withUrl(this.connectionUrl)
      .withAutomaticReconnect()
      .build();

    this._connection.onclose(() => {
      this.storeConnectionStateChange(false);
    });

    this._connection.onreconnected(() => {
      this.storeConnectionStateChange(true);
    });

    this._connection.onreconnecting(() => {
      this.storeConnectionStateChange(false);
    });

    this._connection.on('RecieveEvents', (events) => {
      this._onRecieveEvents(events);
    });

    this._connection.on('RecieveFullData', (data) => {
      this._onRecieveFullData(data);
    });

    this.store$.pipe(select(getCurrentSession)).subscribe((session) => {
      this.log('Session changed: ' + JSON.stringify(session));
      this.activeSession = session;
      if (session) {
        const iSession: ISession = session;
        localStorage.setItem(
          this.localStorageItemKey,
          JSON.stringify(iSession)
        );
      }
      this._activeSessionId = session ? session.sessionId : undefined;
    })
  }

  onRecieveEvents(callback: (events: IEvent[]) => void) {
    this._onRecieveEvents = callback;
  }

  onRecieveFullData(callback: (data: IBRPFullData) => void) {
    this._onRecieveFullData = callback;
  }


  startConnection(): void {
    this.stopConnection();

    this._connection
      .start()
      .then(() => {
        this.storeConnectionStateChange(true);
        this.checkSession();
      })
      .catch((err) => {
        this.storeConnectionStateChange(false, err);
        this.log('Connection error:' + err);
      });
  }

  async leaveSession(): Promise<void> {
    this.snackBar.open('Session left', 'Close', {
      duration: 3000,
    });
    this.store$.dispatch(setCurrentSession({ session: undefined }));
    localStorage.removeItem(this.localStorageItemKey);
  }

  private async stopConnection(): Promise<void> {
    await this._connection?.stop();
    this.storeConnectionStateChange(false);
  }

  async checkSession(): Promise<void> {
    if (localStorage.getItem(this.localStorageItemKey)) {
      const iSession: ISession = JSON.parse(
        localStorage.getItem(this.localStorageItemKey)
      );

      const sessionAvailable: ISession = await this.connection.invoke(
        'GetSession',
        iSession.sessionId
      );

      if (!sessionAvailable) {
        this.leaveSession();
        this.snackBar.open('Session not available', 'Close', {
          duration: 3000,
        });
        return;
      } else {
        const session: Session = new Session();
        session.init(iSession);
        this.store$.dispatch(setCurrentSession({ session: session }));
      }
    }
  }

  get connectionStatus(): boolean {
    return this._connection.state === HubConnectionState.Connected;
  }

  get connection(): HubConnection {
    return this._connection;
  }

  get session(): Session {
    return this.activeSession;
  }

  get sessionStatus(): boolean {
    return this.activeSession ? true : false;
  }

  private storeConnectionStateChange(state: boolean, err?: string) {
    this.log('Connection State Change: ' + state);
    this.store$.dispatch(
      connectionStateChange({
        isConnected: state,
        error: err ? err : undefined,
      })
    );
  }

  private log(message: string, err = false) {
    if (!enableLogging) return;
    if (err) {
      console.error('[ConnectionService] ' + message);
    } else {
      console.log('[ConnectionService] ' + message);
    }
  }
}
