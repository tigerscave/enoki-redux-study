import React from 'react';
import ReactDOM from 'react-dom';

import NoteApp from './components/NoteApp'
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
      console.log('--huga--')
    },
    getState: () => state,
    subscribe: handler => {
      console.log(subscribers)
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

const {PropTypes} = React;

class Provider extends React.Component {
  getChildContext() {
    return {
      store: this.props.store
    };
  }
  render() {
    return this.props.children;
  }
}

// Provider.childContextTypes = {
//   store: PropTypes.object
// };

const connect = (
  mapStateToProps,
  mapDispatchToProps
  ) => Component => {
  console.log('--connect...--')
  class Connected extends React.Component {
    onStoreOrPropsChange() {
      // const {store} = this.context;
      const state = store.getState();
      const stateProps = mapStateToProps(state);
      const dispatchProps = mapDispatchToProps(store.dispatch);
      this.setState({
        ...stateProps,
        ...dispatchProps
      });
    }
    componentDidMount() {
      // const {store} = this.context;
      console.log('yoppi')
      this.onStoreOrPropsChange(this.props);
      this.unsubscribe = store.subscribe(() =>
      this.onStoreOrPropsChange(this.props)
      );
    }
    componentWillReceiveProps(nextProps) {
      this.onStoreOrPropsChange(nextProps);
    }
    componentWillUnmount() {
      this.unsubscribe();
    }
    render() {
      return <Component {...this.props} {...this.state}/>;
    }
  }
  
  // Connected.contextTypes = {
  //   store: PropTypes.object
  // }
  
  return Connected
}

const mapStateToProps = state => ({
  notes: state.notes,
  openNoteId: state.openNoteId
});

const mapDispatchToProps = dispatch => ({
  onAddNote: () => dispatch({
    type: CREATE_NOTE
  }),
  onChangeNote: (id, content) => dispatch({
    type: UPDATE_NOTE,
    id,
    content
  }),
  onOpenNote: id => dispatch({
    type: OPEN_NOTE,
    id
  }),
  onCloseNote: () => dispatch({
    type: CLOSE_NOTE
  })
});

console.log('--before connect--')
const NoteAppContainer = connect(mapStateToProps, mapDispatchToProps)(NoteApp);
console.log('--after connect--')

ReactDOM.render(
  <Provider store={store}>
    <NoteAppContainer/>
  </Provider>,
  document.getElementById('root')
);