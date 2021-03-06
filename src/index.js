import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { put, takeEvery, delay } from 'redux-saga/effects';
import { schema, normalize } from 'normalizr';
import { v4 as uuid } from 'uuid';
import { Provider, connect } from 'react-redux';
import './index.css';

// action types

const TODO_ADD = 'TODO_ADD';
const TODO_TOGGLE = 'TODO_TOGGLE';
const FILTER_SET = 'FILTER_SET';
const NOTIFICATION_SHOW = 'NOTIFICATION_SHOW';
const NOTIFICATION_HIDE = 'NOTIFICATION_HIDE';
const TODO_ADD_WITH_NOTIFICATION = 'TODO_ADD_WITH_NOTIFICATION';

const todos = [
  { id: '0', name: 'learn redux' },
  { id: '1', name: 'Redux Standalone with advanced Actions' },
  { id: '2', name: 'Redux Standalone with advanced Reducers' },
  { id: '3', name: 'Bootstrap App with Redux' },
  { id: '4', name: 'Naive Todo with React and Redux' },
  { id: '5', name: 'Sophisticated Todo with React and Redux' },
  { id: '6', name: 'Connecting State Everywhere' },
  { id: '7', name: 'Todo with advanced Redux' },
  { id: '8', name: 'Todo but more Features' },
  { id: '9', name: 'Todo with Notifications' },
  { id: '10', name: 'Hacker News with Redux' },
];

// schemas

const todoSchema = new schema.Entity('todo');
const normalizedTodos = normalize(todos, [todoSchema]);
const initialTodoState = {
  entities: normalizedTodos.entities.todo,
  ids: normalizedTodos.result,
};

// reducers

const applyAddTodo = (state, action) => {
  const todo = { ...action.todo, completed: false };
  const entities = { ...state.entities, [todo.id]: todo };
  const ids = [ ...state.ids, action.todo.id ];
  return { ...state, entities, ids };
}

const applyToggleTodo = (state, action) => {
  const id = action.todo.id;
  const todo = state.entities[id];
  const toggledTodo = { ...todo, completed: !todo.completed };
  const entities = { ...state.entities, [id]: toggledTodo };
  return { ...state, entities };
};

const applySetFilter = (state, action) => {
  return action.filter;
};

const applySetNotifyAboutAddTodo = (state, action) => {
  const { name, id } = action.todo;
  return { ...state, [id]: 'Todo Created: ' + name };
};

const applyRemoveNotification = (state, action) => {
  const {
    [action.id]: notificationToRemove,
    ...restNotifications
  } = state;
  return restNotifications;
}

const todoReducer = (state = initialTodoState, action) => {
  switch(action.type) {
    case TODO_ADD: {
      return applyAddTodo(state, action);
    }
    case TODO_TOGGLE: {
      return applyToggleTodo(state, action);
    }
    default: return state;
  }
};

const filterReducer = (state = 'SHOW_ALL', action) => {
  switch(action.type) {
    case FILTER_SET: {
      return applySetFilter(state, action);
    }
    default: return state;
  }
};

const notificationReducer = (state = [], action) => {
  switch(action.type) {
    case TODO_ADD: {
      return applySetNotifyAboutAddTodo(state, action);
    }
    case NOTIFICATION_HIDE: {
      return applyRemoveNotification(state, action);
    }
    default: return state;
  }
}

// action creators

const doAddTodo = (id, name) => {
  return {
    type: TODO_ADD,
    todo: { id, name },
  };
};

const doToggleTodo = id => {
  return {
    type: TODO_TOGGLE,
    todo: { id },
  };
};

const doSetFilter = filter => {
  return {
    type: FILTER_SET,
    filter,
  };
};

const doShowNotification = (text, id) => {
  return {
    type: NOTIFICATION_SHOW,
    text,
    id,
  };
};

const doHideNotification = id => {
  return {
    type: NOTIFICATION_HIDE,
    id,
  }
}

const doAddTodoWithNotification = (id, name) => {
  return {
    type: TODO_ADD_WITH_NOTIFICATION,
    todo: { id, name },
  };
};

//sagas

function* watchAddTodoWithNotification() {
  yield takeEvery(TODO_ADD_WITH_NOTIFICATION, handleAddTodoWithNotification);
};

function* handleAddTodoWithNotification(action) {
  const { todo } = action;
  const { id, name } = todo;
  yield put(doAddTodo(id, name));
  yield delay(5000);
  yield put(doHideNotification(id));
};

// store

const rootReducer = combineReducers({
  todoState: todoReducer,
  filterState: filterReducer,
  notificationState: notificationReducer,
});

const logger = createLogger();
const saga = createSagaMiddleware();

const store = createStore(rootReducer, undefined, applyMiddleware(saga, logger));

saga.run(watchAddTodoWithNotification);

// components

const TodoApp = () => {
  return (
    <div>
      <ConnectedFilter />
      <ConnectedTodoCreate />
      <ConnectedTodoList />
      <ConnectedNotifications />
    </div>
  );
};

const TodoList = ({ todosAsIds }) => {
  return (
    <div>
      {todosAsIds.map(todoId =>
          <ConnectedTodoItem
            key={todoId}
            todoId={todoId}
          />
        )
      }
    </div>
  );
};

const TodoItem = ({ todo, onToggleTodo }) => {
  const { name, id, completed } = todo;

  return (
    <div>
      {name}
      <button type='button' onClick={() => onToggleTodo(id)}>
        {completed ? 'Incomplete' : 'Complete'}
      </button>
    </div>
  );
};

const TodoCreate = props => {
  const [value, setValue] = useState('');

  const onCreateTodo = event => {
    props.onAddTodo(value);
    setValue('');
    event.preventDefault();
  };

  const onChangeName = event => {
    setValue(event.target.value);
  };

  return (
    <div>
      <form onSubmit={onCreateTodo}>
        <input
          type='text'
          placeholder='Add Todo ...'
          value={value}
          onChange={onChangeName}
        />
        <button type='submit'>Add</button>
      </form>
    </div>
  )
}

const Filter = ({ onSetFilter }) => {
  return (
    <div>
      Show
      <button
        type='button'
        onClick={() => onSetFilter('SHOW_ALL')}
      >
        All
      </button>
      <button
        type='button'
        onClick={() => onSetFilter('SHOW_COMPLETED')}
      >
        Completed
      </button>
      <button
        type='button'
        onClick={() => onSetFilter('SHOW_INCOMPLETED')}
      >
        Incompleted
      </button>
    </div>
  )
}

const Notifications = ({ notifications }) => {
  return (
    <div>
      {notifications.map(note => <div key={note}>{note}</div>)}
    </div>
  )
}

// filters

const VISIBILITY_FILTERS = {
  SHOW_COMPLETED: item => item.completed,
  SHOW_INCOMPLETED: item => item.incompleted,
  SHOW_ALL: item => true,
}

// selectors

const getTodosAsIds = state => {
  return state.todoState.ids
    .map(id => state.todoState.entities[id])
    .filter(VISIBILITY_FILTERS[state.filterState])
    .map(todo => todo.id);
}

const getTodo = (state, todoId) => {
  return state.todoState.entities[todoId];
}

const getNotifications = state => {
  return getArrayOfObject(state.notificationState);
}

const getArrayOfObject = object => {
  return Object.keys(object).map(key => object[key]);
}

// Connecting React and Redux

const mapStateToPropsList = state => {
  return {
    todosAsIds: getTodosAsIds(state),
  };
};

const mapStateToPropsItem = (state, props) => {
  return {
    todo: getTodo(state, props.todoId),
  };
};

const mapDispatchToPropsItem = dispatch => {
  return {
    onToggleTodo: id => dispatch(doToggleTodo(id)),
  };
};

const mapDispatchToPropsTodoCreate = dispatch => {
  return {
    onAddTodo: name => dispatch(doAddTodoWithNotification(uuid(), name)),
  };
};

const mapDispatchToPropsFilter = dispatch => {
  return {
    onSetFilter: filterType => dispatch(doSetFilter(filterType)),
  };
};

const mapStateToPropsNotifications = (state, props) => {
  return {
    notifications: getNotifications(state),
  }
}

const ConnectedTodoList = connect(mapStateToPropsList)(TodoList);
const ConnectedTodoItem = connect(mapStateToPropsItem, mapDispatchToPropsItem)(TodoItem);
const ConnectedTodoCreate = connect(null, mapDispatchToPropsTodoCreate)(TodoCreate);
const ConnectedFilter = connect(null, mapDispatchToPropsFilter)(Filter);
const ConnectedNotifications = connect(mapStateToPropsNotifications)(Notifications);

ReactDOM.render(
    <Provider store={store}>
      <TodoApp />
    </Provider>,
  document.getElementById('root')
);
