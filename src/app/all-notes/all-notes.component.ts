import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

import { Note } from "../interfaces/note";
import { NotesService } from "../services/notes.service";
import { animate, keyframes, state, style, transition, trigger } from "@angular/animations";
import saveNotesToStore from "../services/save-to-store";

@Component({
  selector: 'app-all-notes',
  templateUrl: './all-notes.component.html',
  styleUrls: ['./all-notes.component.scss'],
  animations: [
    trigger("inOutAnimation", [
      state("in", style({ opacity: 1 })),
      transition(":enter", [
        animate(
          240,
          keyframes([
            style({ height: '0px', overflow: 'hidden' }),
            style({ height: '47px', overflow: 'hidden' }),
          ])
        )
      ]),
      transition(":leave", [
        animate(
          240,
          keyframes([
            style({ height: '47px', overflow: 'hidden' }),
            style({ height: '0px', overflow: 'hidden' }),
          ])
        )
      ])
    ])
  ]
})
export class AllNotesComponent implements OnInit, AfterViewInit {
  allNotes: Note[];
  allNotesClone: Note[];
  selectedNote: Note;
  title: String;
  description: String;
  sidebarStatus = 'open';
  searchText: String;
  private innerWidth: number;

  @ViewChild('titleInput') titleInput: ElementRef;
  @ViewChild('descInput') descInput: ElementRef;
  @ViewChild('overallList') overallList: ElementRef;
  hideIcon: boolean;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    if (window.innerWidth < 780) {
      this.sidebarStatus = 'close';
    }
  }

  constructor(private notesService: NotesService) { }

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    if (window.innerWidth < 780) {
      this.sidebarStatus = 'close';
    }
    this.notesService.getState().subscribe(res => {
      this.allNotes = res.allNotes;
      this.allNotesClone = [...res.allNotes];
      this.sidebarStatus = res.sidebarStatus;
      this.selectedNote = this.notesService.getCurrentNode();
      this.title = this.selectedNote.title;
      this.description = this.selectedNote.description;
      saveNotesToStore(this.allNotes);
    });
    if (localStorage.getItem('NotesList')) {
      this.allNotes = JSON.parse(localStorage.getItem('NotesList'));
    }
  }

  addNewNote() {
    const postObj: Note = {
      id: new Date().getTime(),
      title: 'New Note',
      description: 'Note Description',
      time: new Date()
    }
    this.notesService.addNote(postObj);
    this.notesService.updateCurrentNode(postObj.id);
    setTimeout(() => {
      this.sidebarStatus = 'open';
      this.titleInput.nativeElement.focus();
    }, 300);
  }

  updateNote(event, value: string) {
    const updatedNote = {
      ...this.selectedNote,
      [value]: event
    }
    this.notesService.updateNote(updatedNote, value);
    setTimeout(() => {
      this.overallList.nativeElement.scrollTo({ top: 0, behaviour: 'smooth' });
    }, 300);
  }

  changeActiveState(activeNote: Note) {
    this.notesService.updateCurrentNode(activeNote.id);
    this.titleInput.nativeElement.focus();
  }

  toggleSidebar() {
    this.notesService.changeSidebarStatus();
  }

  ngAfterViewInit(): void {
    if (this.titleInput) {
      this.titleInput.nativeElement.focus();
    }
  }

  changeFocus() {
    this.descInput.nativeElement.focus();
  }

  deleteNote() {
    this.notesService.deleteNote(this.selectedNote.id);
  }

  searchFunction($event: string) {
    if ($event) {
      const notesClone = [...this.allNotesClone];
      this.allNotes = notesClone.filter(each =>
        each.title.toLowerCase().includes($event.toLowerCase()) || each.description.toLowerCase().includes($event.toLowerCase()) );
    }
  }

  blurCheck() {
    if (!this.selectedNote.title && !this.selectedNote.description) {
      this.notesService.deleteNote(this.selectedNote.id);
    }
  }

  inputSearchFocused() {
    if (this.innerWidth < 480) {
      this.hideIcon = true;
    }
  }

  inputSearchBlur() {
    if (this.innerWidth < 480) {
      this.hideIcon = false;
    }
  }
}
