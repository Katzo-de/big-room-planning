import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConnectionComponent } from './connection/connection.component';
import { ConnectionService } from './connection/connection.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ConnectionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public connectionService = inject(ConnectionService);


  constructor() {
    this.connectionService.startConnection();
  }
}
