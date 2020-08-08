import React from 'react';
import ReactDOM from 'react-dom';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import { Provider, connect } from 'react-redux';
import './index.css';

// action types

const TODO_ADD = 'TODO_ADD';
const TODO_TOGGLE = 'TODO_TOGGLE';
const FILTER_SET = 'FILTER_SET';

// reducers

const todos = [
  { id: '0', name: 'learn redux' },
  { id: '1', name: 'learn mobx' },
];

const applyAddTodo = (state, action) => {
  const todo = { ...action.todo, completed: false };
  return [ ...state, todo ];
}

const applyToggleTodo = (state, action) => {
  return state.map(todo =>
    todo.id === action.todo.id
      ? { ...todo, completed:  !todo.completed }
      : todo
  );
};

const applySetFilter = (state, action) => {
  return action.filter;
};

const todoReducer = (state = todos, action) => {
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

// action creators

const doAddTodo = (id, name) => {
  return {
    type: TODO_ADD,
    todo: { id, name },
  }
}

const doToggleTodo = id => {
  return {
    type: TODO_TOGGLE,
    todo: { id },
  }
};

const doSetFilter = filter => {
  return {
    type: FILTER_SET,
    filter,
  }
};

// store

const rootReducer = combineReducers({
  todoState: todoReducer,
  filterState: filterReducer,
});

const logger = createLogger();

const store = createStore(rootReducer, undefined, applyMiddleware(logger));

// components

const TodoApp = () => {
  return (
    <ConnectedTodoList />
  );
};

const TodoList = ({ todos }) => {
  return (
    <div>
      {todos.map(todo =>
          <ConnectedTodoItem
            key={todo.id}
            todo={todo}
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

// Connecting React and Redux

const mapStateToProps = state => {
  return {
    todos: state.todoState,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onToggleTodo: id => dispatch(doToggleTodo(id)),
  };
};

const ConnectedTodoList = connect(mapStateToProps)(TodoList);
const ConnectedTodoItem = connect(null, mapDispatchToProps)(TodoItem);

ReactDOM.render(
    <Provider store={store}>
      <TodoApp />
    </Provider>,
  document.getElementById('root')
);
