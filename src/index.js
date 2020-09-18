import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const initialState = {
  nextNoteId: 1,
  notes: {}
};

const CREATE_NOTE = 'CREATE_NOTE';
const UPDATE_NOTE = 'UPDATE_NOTE';

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_NOTE: {
      const id = state.nextNoteId;
      const newNote = {
        id,
        content: ''
      };
      return {
        ...state,
        nextNoteId: id + 1,
        notes: {
          ...state.notes,
          [id]: newNote
        }
      };
    }
    case UPDATE_NOTE: {
      const {id, content} = action;
      const editedNote = {
        ...state.notes[id],
        content
      };
      return {
        ...state,
        notes: {
          ...state.notes,
          [id]: editedNote
        }
      };
    }
    default:
      return state;
  }
};

const state0 = reducer(undefined, {
  type: CREATE_NOTE
});

const state1 = reducer(state0, {
  type: UPDATE_NOTE,
  id: 2,
  content: 'Hello, world!'
});

ReactDOM.render(
  <pre>{JSON.stringify(state1, null, 2)}</pre>,
  document.getElementById('root')
);

// const NoteApp = ({notes}) => (
//   <div>
//     <ul className="note-list">
//     {
//       Object.keys(notes).map(id => (
//         // Obviously we should render something more interesting than the id.
//         <li className="note-list-item" key={id}>{id}</li>
//       ))
//     }
//     </ul>
//     <button className="editor-button" onClick={onAddNote}>New Note</button>
//   </div>
// );

// const renderApp = () => {
//   ReactDOM.render(
//     <NoteApp notes={window.state.notes}/>,
//     document.getElementById('root')
//   );
// };

// renderApp();