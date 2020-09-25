import React from 'react'
import NoteTitle from './NoteTitle'

const NoteLink = ({note, onOpenNote}) => (
  <li className="note-list-item">
    <button onClick={() => onOpenNote(note.id)}>
      <NoteTitle note={note}/>
    </button>
  </li>
);

export default NoteLink