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


store.subscribe(() => {
  console.log('***render***')
  ReactDOM.render(
    <pre>{JSON.stringify(store.getState(), null, 2)}</pre>,
    document.getElementById('root')
    )
});

console.log('---before dispatch---')

store.dispatch({
  type: CREATE_NOTE
})

console.log('---after 1st dispatch---')
console.log(store)

store.dispatch({
  type: UPDATE_NOTE,
  id: 1,
  content: 'Hello, world!'
})

console.log('---after 2nd dispatch---')
console.log(store.getState())