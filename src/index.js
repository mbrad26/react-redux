import React from 'react';
import ReactDOM from 'react-dom';
import { combineReducers, createStore } from 'redux';
import './index.css';

const TODO_ADD = 'TODO_ADD';
const TODO_TOGGLE = 'TODO_TOGGLE';
const FILTER_SET = 'FILTER_SET';

const todos = [
  { id: '0', name: 'learn redux' },
  { id: '1', name: 'learn mobx' },
];

const applyAddTodo = (state, action) => {
  const todo = Object.assign({}, action.todo, { completed: false });
  return state.concat(todo);
}

const applyToggleTodo = (state, action) => {
  return state.map(todo =>
    todo.id === action.todo.id
      ? Object.assign({}, todo, { completed: !todo.completed })
      : todo
  );
};

const applySetFilter = (state, action) => {
  return action.filter;
};

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

const filterReducer = (state, action) => {
  switch(action.type) {
    case FILTER_SET: {
      return applySetFilter(state, action);
    }
    default: return state;
  }
};

const rootReducer = combineReducers({
  todoState: todoReducer,
  filterState: filterReducer,
});

const TodoApp = () => {
  return (
    <div>Todo App</div>
  );
};

ReactDOM.render(
    <TodoApp />,
  document.getElementById('root')
);
