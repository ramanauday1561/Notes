import { Injectable } from '@angular/core';

import { Note } from "../interfaces/note";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  allNotes: Note[] = [];

  state = {
    currentNode: null,
    sidebarStatus: 'open',
    allNotes: this.allNotes
  }

  public notesSubject = new BehaviorSubject(this.state);
  public notesObservable = this.notesSubject.asObservable();

  getState(): Observable<any> {
    return this.notesObservable;
  }

  resetState() {
    const emptyState = {
      currentNode: null,
      sidebarStatus: 'open',
      allNotes: []
    }
    this.notesSubject.next(emptyState);
    localStorage.clear();
  }

  getNotes() {
    return this.notesSubject.value.allNotes;
  }

  loadPreviousState(data) {
    const changedVal = {
      ...this.notesSubject.value,
      currentNode: data.currentNode,
      allNotes: data.allNotes,
    }
    this.notesSubject.next(changedVal);
  }

  getCurrentNode() {
    let node = this.notesSubject.value.currentNode ?
      this.notesSubject.value.currentNode : {
        id: 0,
        title: '',
        description: '',
        time: new Date()
      };
    return node;
  }

  updateCurrentNode(id: number) {
    const cloneState = {
      ...this.notesSubject.value,
      currentNode: this.getNotes().sort().filter(each => each.id === id)[0]
    };
    localStorage.setItem('activeNote', String(cloneState.currentNode.id));
    this.notesSubject.next(cloneState);
  }

  addNote(note: Note) {
    const addedNote = {
      ...this.notesSubject.value,
      allNotes: [note, ...this.getNotes()]
    }
    this.notesSubject.next(addedNote);
  }

  updateNote(note: Note, value: string) {
    let removedNote = this.getNotes().filter(each => each.id === note.id)[0];
    removedNote = removedNote ? removedNote : note;
    removedNote[value] = note[value];
    const removedList = {
      ...this.notesSubject.value,
      allNotes: [...this.getNotes().filter(each => each.id !== note.id)]
    }
    const indexVal = this.getNotes().findIndex((each: Note) => each.id === note.id);
    if (indexVal !== 0) {
      this.notesSubject.next(removedList);
    }
    setTimeout(() => {
      const addElement = {
        ...this.notesSubject.value,
        allNotes: [removedNote, ...removedList.allNotes]
      }
      this.notesSubject.next(addElement);
    }, 30)
  }

  deleteNote(id: number) {
    let currentNodeVal: number;
    const deleteIndex = this.getNotes().findIndex(each => each.id === id);
    if (deleteIndex === this.getNotes().length - 1) {
      currentNodeVal = deleteIndex - 1;
    } else if (deleteIndex < this.getNotes().length - 1) {
      currentNodeVal = deleteIndex + 1;
    }
    const filterNodes = {
      ...this.notesSubject.value,
      currentNode: this.getNotes()[currentNodeVal],
      allNotes: this.getNotes().filter(each => each.id !== id)
    }
    this.notesSubject.next(filterNodes);
  }

  getSidebarStatus() {
    return this.notesSubject.value.sidebarStatus;
  }

  changeSidebarStatus(val: string) {
    const filterState = {
      ...this.notesSubject.value,
      sidebarStatus: val
    }
    this.notesSubject.next(filterState);
  }

  constructor() {}
}
