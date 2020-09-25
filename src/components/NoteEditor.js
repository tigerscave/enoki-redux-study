import React from 'react';

const NoteEditor = ({note, onChangeNote, onCloseNote}) => (
  <div>
    <div>
      <textarea
        className='editor-content'
        autoFocus
        value={note.content}
        onChange={event =>
          onChangeNote(note.id, event.target.value)
        }
      />
      <button className='editor-button' onClick={onCloseNote}>
        close
      </button>
    </div>
  </div> 
)

export default NoteEditor