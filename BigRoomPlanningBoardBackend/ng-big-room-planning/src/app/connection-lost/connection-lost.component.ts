import {
  Component,
  Input,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { DataService } from '../data.service';

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

  @Input()
  error: string | undefined;

  constructor (
    private dataService: DataService
  ) {
  }

  reconnect() {
    this.dataService.openConnection();
  }
}
