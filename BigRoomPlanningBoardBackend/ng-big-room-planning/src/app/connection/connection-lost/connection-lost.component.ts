import {
  Component,
  Input,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { ConnectionService } from '../connection.service';

@Component({
  selector: 'app-connection-lost',
  standalone: true,
  imports: [
    MatButton,
    MatCardModule
  ],
  templateUrl: './connection-lost.component.html',
  styleUrl: './connection-lost.component.scss'
})
export class ConnectionLostComponent {

  /**
   * Error Message
   */
  @Input() 
  error: string | undefined;

  constructor(
    private connectionService: ConnectionService
  ) { }

  /**
   * Reconnect Methode
   */
  reconnect() {
    this.connectionService.startConnection();
  }
}
