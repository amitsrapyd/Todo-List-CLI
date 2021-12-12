import { State } from '../interfaces/state.interface';
import { Todo, Next } from './interfaces/index';
import { generateID } from '../lib/index';

export function createTodo(state: State, title: string, next: Next) {
  if (title === '') return;

  const todo: Todo = {
    id: generateID(),
    title,
    isChecked: false
  };
  state.todos.push(todo);

  next.onSuccess();
}

export function toggleTodo(state: State, id: string, next: Next) {
  const todo: Todo | undefined = state.todos.find(todo => todo.id === id);
  if (todo === undefined) {
    const { onError } = next;
    return onError !== undefined ? onError('item not found') : undefined;
  }

  todo.isChecked = !todo.isChecked;
  next.onSuccess();
}

export function removeTodo(state: State, id: string, next: Next) {
  const todo: Todo | undefined = state.todos.find(todo => todo.id === id);
  if (todo === undefined) {
    const { onError } = next;
    return onError !== undefined ? onError('item not found') : undefined;
  }

  state.todos = state.todos.filter(todo => todo.id !== id);
  next.onSuccess();
}
