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
    // nextNoteId: 1,
    isLoading: false,
    notes: {},
    openNoteId: null,
  };
  
  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case CREATE_NOTE: {
        if (!action.id) {
          return {
            ...state,
            isLoading: true
          };
        }
        // const id = state.nextNoteId;
        const newNote = {
          id: action.id,
          content: ''
        };
        return {
          ...state,
          // nextNoteId: id + 1,
          openNoteId: action.id,
          notes: {
            ...state.notes,
            [action.id]: newNote
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
        return {
          ...state,
          openNoteId: action.id
        };
      }
      case CLOSE_NOTE: {
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

const createStore = (reducer_, middleware) => {
  let state = undefined;
  const subscribers = [];
  const coreDispatch = action => {
    validateAction(action);
    state = reducer(state, action)
    subscribers.forEach(handler => handler())
  };
  const getState = () => state
  const store = {
    dispatch: coreDispatch,
    getState,
    subscribe: handler => {
      subscribers.push(handler);
      return () => {
        const index = subscribers.indexOf(handler);
        if (index > 0) {
          subscribers.splice(index, 1)
        }
      }
    }
  };
  if (middleware) {
    const dispatch = action => store.dispatch(action);
    console.log(middleware)
    store.dispatch = middleware({dispatch, getState})(coreDispatch);
  }
  coreDispatch({type: '@@redux/INIT'})
  return store
}

// const delayMidlleware = () => next => action => {
//   setTimeout(() => {
//     next(action);
//   }, 1000);
// }

const thunkMiddleware = ({dispatch, getState}) => next => action => {
  if (typeof action === 'function') {
    return action(dispatch, getState);
  }
  return next(action);
};

const loggingMiddleware = ({getState}) => next => action => {
  console.info("before", getState());
  console.info("action", action)
  const result = next(action);
  console.info("after", getState())
  return result
}

const applyMiddleware = (...middlewares) => store => {
  if (middlewares.length === 0) {
    return dispatch => dispatch;
  }
  if (middlewares.length === 1) {
    return middlewares[0](store);
  }
  const boundMiddlewares = middlewares.map(middleware =>
    middleware(store)
  );
  return boundMiddlewares.reduce((a,b) => 
    next => a(b(next))
  )
};

const store = createStore(reducer, applyMiddleware(
  thunkMiddleware,
  loggingMiddleware
  ));

// const {PropTypes} = React;

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

// API

const createFakeApi = () => {
  let _id =0;
  const createNote = () => new Promise(resolve =>
    setTimeout(() => {
      _id++;
      resolve({
        id: `${_id}`
      });
    }, 1000))
    return {
      createNote
    };
};

const api = createFakeApi();

const createNote = () => {
  return (dispatch) => {
    dispatch({
      type: CREATE_NOTE
    });
    api.createNote().then(({id}) => {
      dispatch({
        type: CREATE_NOTE,
        id
      })
    });
  }
}

const mapStateToProps = state => ({
  notes: state.notes,
  openNoteId: state.openNoteId
});

const mapDispatchToProps = dispatch => ({
  // onAddNote: () => dispatch({
  //   type: CREATE_NOTE
  // }),
  onAddNote: () => dispatch(createNote()),
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