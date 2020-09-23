import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


//action types
const CREATE_NOTE = 'CREATE_NOTE';
const UPDATE_NOTE = 'UPDATE_NOTE';
const OPEN_NOTE = 'OPEN_NOTE';
const CLOSE_NOTE = 'CLOSE_NOTE';



//reducer
const initialState = {
  nextNoteId: 1,
  notes: {},
  openNoteId: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_NOTE: {
      const id = state.nextNoteId;
      const newNote = {
        id,
        content: ''
      };
      console.log('---before CREATE_NOTE---')
      console.log(store.getState())
      return {
        ...state,
        nextNoteId: id + 1,
        openNoteId: id,
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
    case OPEN_NOTE: {
      console.log('---before OPEN_NOTE---')
      console.log(store.getState())
      return {
        ...state,
        openNoteId: action.id
      };
    }
    case CLOSE_NOTE: {
      console.log('---before CLOSE_NOTE---')
      console.log(store.getState())
      return {
        ...state,
        openNoteId: null
      }
    }
    default:
      return state;
  }
};




//store

const validateAction = action => {
  if (!action || typeof action !== 'object' || Array.isArray(action)) {
    throw new Error ('Action must be an object!');
  }
  if (typeof action.type === 'undefined') {
    throw new Error ('Action must have a type!');
  }
};

const createStore = (reducer_) => {
  let state = undefined;
  const subscribers = [];
  const store = {
    dispatch: (action) => {
      validateAction(action);
      state = reducer_(state, action);
      subscribers.forEach(handler => handler())
    },
    getState: () => state,
    subscribe: handler => {
      subscribers.push(handler);
      console.log(subscribers)
      return () => {
        const index = subscribers.indexOf(handler);
        if (index > 0) {
          subscribers.splice(index, 1)
        }
      }
    }
  };
  store.dispatch({type: '@@redux/INIT'})
  return store
}

const store = createStore(reducer);

console.log(store.getState())


// store.subscribe(() => {
//   console.log('***render***')
//   ReactDOM.render(
//     <pre>{JSON.stringify(store.getState(), null, 2)}</pre>,
//     document.getElementById('root')
//     )
// });

// console.log('---before dispatch---')

// store.dispatch({
//   type: CREATE_NOTE
// })

// console.log('---after 1st dispatch---')
// console.log(store)

// store.dispatch({
//   type: UPDATE_NOTE,
//   id: 1,
//   content: 'Hello, world!'
// })

// console.log('---after 2nd dispatch---')
// console.log(store.getState())



//components

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

const NoteTitle = ({note}) => {
  const title = note.content.split('¥n')[0].replace(/^¥s+|¥s+$/g, '');
  if (title === '') {
    return <i>Untitled</i>;
  }
  return <span>{title}</span>
};

const NoteLink = ({note, onOpenNote}) => (
  <li className="note-list-item">
    <button onClick={() => onOpenNote(note.id)}>
      <NoteTitle note={note}/>
    </button>
  </li>
);

const NoteList = ({notes, onOpenNote}) => (
  <ul className="note-list">
    {
      Object.keys(notes).map(id =>
        <NoteLink
          key={id}
          note={notes[id]}
          onOpenNote={onOpenNote}
        />
      )
    }
  </ul>
);

const NoteApp = ({
  notes,
  openNoteId,
  onAddNote,
  onChangeNote,
  onOpenNote,
  onCloseNote
}) => (
  <div>
    {
      openNoteId ?
        <NoteEditor
          note={notes[openNoteId]}
          onChangeNote={onChangeNote}
          onCloseNote={onCloseNote}
        /> :
        <div>
          <NoteList
            notes={notes}
            onOpenNote={onOpenNote}
          />
          <button
            className='editor-button'
            onClick={onAddNote}
          >
            New Note !
          </button>
        </div>
    }
  </div>
);

class NoteAppContainer extends React.Component {
  constructor(props) {
    super();
    this.state = props.store.getState();
    this.onAddNote = this.onAddNote.bind(this);
    this.onChangeNote = this.onChangeNote.bind(this);
    this.onOpenNote = this.onOpenNote.bind(this);
    this.onCloseNote = this.onCloseNote.bind(this);
  }
  componentDidMount() {
    console.log('componentWillMount')
    this.unsubscribe = this.props.store.subscribe(() =>
    this.setState(this.props.store.getState())
    );
  }
  componentWillUnmount() {
    console.log('componentWillUnmount')
    this.unsubscribe();
  }
  onAddNote() {
    this.props.store.dispatch({
      type: CREATE_NOTE
    });
  }
  onChangeNote(id, content) {
    this.props.store.dispatch({
      type: UPDATE_NOTE,
      id,
      content
    });
  }
  onOpenNote(id) {
    this.props.store.dispatch({
      type: OPEN_NOTE,
      id
    });
  }
  onCloseNote() {
    this.props.store.dispatch({
      type: CLOSE_NOTE
    })
  }
  render() {
    return (
      <NoteApp
        {...this.state}
        onAddNote={this.onAddNote}
        onChangeNote={this.onChangeNote}
        onOpenNote={this.onOpenNote}
        onCloseNote={this.onCloseNote}
      />
    )
  }
}

ReactDOM.render(
  <NoteAppContainer store={store}/>,
  document.getElementById('root')
);