let debounceTimer = null;
export default function saveNotesToStore(allNotes) {
  if (debounceTimer != null) {
    window.clearTimeout(debounceTimer);
  }

  debounceTimer = window.setTimeout(() => {
    localStorage.setItem('NotesList', JSON.stringify(allNotes));
    debounceTimer = null;
  }, 5000)
}
