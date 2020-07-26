import { Component, OnInit } from '@angular/core';

import { NotesService } from "../services/notes.service";

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  constructor(private notesService: NotesService) { }

  ngOnInit(): void { }

  resetNotes() {
    this.notesService.resetState();
  }

}
