import {
  Injectable,
  OnDestroy
} from '@angular/core';
import {
  interval,
  Subscription,
  switchMap
} from 'rxjs';
import {
  select,
  Store
} from '@ngrx/store';
import {
  AddSessionEvent,
  BRPFullData,
  Event,
  IBRPFullData,
  IEvent,
} from './client';
import {
  ProcessEventService
} from './process-event.service';
import {
  Queue
} from './queue';
import {
  applyFullData,
} from './store/app.actions';
import { 
  getLastEventId 
} from './store/app.selectors';
import { 
  ConnectionService
} from './connection/connection.service';

/**
 * ping interval ms
 */
const pingInterval = 1000;

const enableLogging = true;

@Injectable({
  providedIn: 'root',
})
export class DataService implements OnDestroy {
  private queue = new Queue<IEvent>();

  private isProcessingQueue = false;

  private subscription = new Subscription();

  pingUpdate$ = interval(pingInterval)
    .pipe(switchMap(() => this.store$.pipe(select(getLastEventId))))
    .subscribe((lastEventId) => {
      if (this.connectionService.connectionStatus && this.connectionService.activeSessionId) {
        this.connectionService.connection
          .invoke(
            'GetUpdated',
            lastEventId,
            this.connectionService.activeSessionId
          )
          .catch((err) => console.error('pingUpdate: ' + err));
      }
    });

  constructor(
    private store$: Store<any>,
    private connectionService: ConnectionService,
    private processEventService: ProcessEventService
  ) {
    this.queue.length()
    
    this.connectionService.onRecieveFullData((events: IBRPFullData) => {
      this.recieveFullData(events);
    });

    this.connectionService.onRecieveEvents((data: IEvent[]) =>
      this.recieveEvents(data)
    );

    this.subscription.add(this.pingUpdate$);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  sendEvent(event: Event) {
    this.connectionService.connection.invoke('AddEvent', event);

    if (event instanceof AddSessionEvent) {
      this.connectionService.activeSessionId = event.sessionId;
    }
    this.processEventService.processEvent(
      event,
      this.connectionService.activeSessionId,
      this.connectionService.connection
    );
  }

  private recieveEvents(events: IEvent[]) {
    if (!events?.length) {
      return;
    }
    this.log('[Data] recieved events: ' + events.length);

    this.queue.add(...events);

    this.log('[Data] is already processing: ' + this.isProcessingQueue);
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  private recieveFullData(fullData: IBRPFullData) {
    this.queue.clear();

    this.log('Recieved full data package: ', fullData);

    const instance = BRPFullData.fromJS(fullData);

    this.store$.dispatch(applyFullData({ fullData: instance }));
  }

  private async processQueue() {
    this.isProcessingQueue = true;

    let lastQueueItem: IEvent | undefined;

    try {
      this.log('[Queue] Start processing');

      while (this.queue.length() > 0) {
        const item = this.queue.get();
        lastQueueItem = item;
        this.log('[Queue] processing item', item);
        const instance = Event.fromJS(item);
        await this.processEventService.processEvent(
          instance,
          this.connectionService.activeSessionId,
          this.connectionService.connection
        );
      }
    } catch (err) {
      console.error(
        'Failed to process events. Dropping queue and requesting full data. Last event bevor error occurred: ',
        lastQueueItem
      );
      console.error(err);

      await this.connectionService.connection.invoke(
        'RequestFullData',
        this.connectionService.activeSessionId,
      );
      this.queue.clear();
    }

    this.log('[Queue] Stop processing');
    this.isProcessingQueue = false;
  }

  private log(message: string, ...args: any[]) {
    if (enableLogging) {
      console.log(message, ...args);
    }
  }
}
