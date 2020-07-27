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
  private firstTime = true;

  @ViewChild('titleInput') titleInput: ElementRef;
  @ViewChild('descInput') descInput: ElementRef;
  @ViewChild('overallList') overallList: ElementRef;
  @ViewChild('detailsContainer') detailsContainer: ElementRef;
  hideIcon: boolean;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    if (window.innerWidth < 780) {
      this.notesService.changeSidebarStatus('close');
    }
  }

  constructor(private notesService: NotesService) { }

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    if (window.innerWidth < 780) {
      this.notesService.changeSidebarStatus('close');
    }
    this.notesService.getState().subscribe(res => {
      this.allNotes = res.allNotes;
      this.allNotesClone = [...res.allNotes];
      this.sidebarStatus = res.sidebarStatus;
      this.detailsContainerHandler();
      this.assignActiveState();
      saveNotesToStore(this.allNotes);
    });
    this.loadPreviousData();
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
    if (this.innerWidth < 400) {
      this.sidebarStatus = 'close';
      this.notesService.changeSidebarStatus('close');
    }
  }

  toggleSidebar() {
    const toggleVal = this.sidebarStatus === 'open' ? 'close' : 'open';
    this.notesService.changeSidebarStatus(toggleVal);
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
    } else {
      this.allNotes = [...this.allNotesClone];
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

  private loadPreviousData() {
    if (localStorage.getItem('NotesList')) {
      this.allNotes = JSON.parse(localStorage.getItem('NotesList'));
      if (this.allNotes.length > 0) {
        const activeNoteId = +localStorage.getItem('activeNote');
        const activeNote = this.allNotes.filter(each => each.id === activeNoteId)[0];
        this.title = activeNote.title;
        this.description = activeNote.description;
        this.notesService.loadPreviousState({
          currentNode: activeNote,
          allNotes: this.allNotes
        });
      }
    }
  }

  private assignActiveState() {
    if (!this.firstTime) {
      this.selectedNote = this.notesService.getCurrentNode();
      this.title = this.selectedNote.title;
      this.description = this.selectedNote.description;
    }
    this.firstTime = false;
  }

  private detailsContainerHandler() {
    if (this.innerWidth < 400 && this.detailsContainer) {
      if (this.sidebarStatus === 'open') {
        this.detailsContainer.nativeElement.style.display = 'none';
        this.detailsContainer.nativeElement.style.overflow = 'hidden';
      } else {
        this.detailsContainer.nativeElement.style.display = 'block';
      }
    }
  }
}
