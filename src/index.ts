import fs from 'fs/promises';
import path from 'path';
import { createInterface } from 'readline';
import { createTodo, toggleTodo, removeTodo } from './todo/todo.model';
import { saveFile, readLine } from './lib/index';
import { Next } from './todo/interfaces/index';
import { State } from './interfaces/state.interface';

const readlineInterface = createInterface({
  input: process.stdin,
  output: process.stdout
});

readlineInterface.on('close', function () {
  process.exit(0);
});

function showTodos(state: State, next?: Next) {
  state.todos.forEach(todo => {
    console.log(
      `ID: ${todo.id}, Title: ${todo.title}, Checked: ${todo.isChecked}`
    );
  });

  next?.onSuccess();
}

function showHelpMessage() {
  const helpMessage =
    `
-c, --create string       Create a todo item
-ls, --list               List all todo items
-u, --update ID           Toggle complete flag for one todo item
-r, --remove ID           Remove todo item from list
-it                       Activate interactive mode
`;

  console.log(helpMessage);
}

async function showMenu(state: State, initialCall: boolean, successCb: Function) {
  if (!initialCall) {
    await readLine(readlineInterface, 'press any key to continue...');
  }

  console.clear();
  const questions = `
Please choose a number between 1 to 5:
1) Create Todo
2) Toggle Todo
3) Delete Todo
4) Show Todos
5) Quit
`;

  const handleSuccess = (message: string) => {
    return () => {
      console.log(message);
      successCb();
    }
  };

  const handleError = (errorMessage: string) => {
    console.log(errorMessage);
    showMenu(state, false, successCb);
  };

  const option = await readLine(readlineInterface, questions);
  if (option === '1') {
    const title: string = await readLine(readlineInterface, 'Enter todo title: ');
    createTodo(state, title, {
      onSuccess: handleSuccess('Created Successfully')
    });
  } else if (option === '2') {
    const id: string = await readLine(readlineInterface, 'Enter todo id: ');
    toggleTodo(state, id, {
      onSuccess: handleSuccess('Updated Successfully'),
      onError: handleError
    });
  } else if (option === '3') {
    const id: string = await readLine(readlineInterface, 'Enter todo id: ');
    removeTodo(state, id, {
      onSuccess: handleSuccess('Removed Successfully'),
      onError: handleError
    });
  } else if (option === '4') {
    showTodos(state, {
      onSuccess: () => showMenu(state, false, successCb)
    });
  } else if (option === '5') {
    readlineInterface.close();
  } else {
    console.log('Please enter a valid number between 1 to 5');
    showMenu(state, false, successCb);
  }
}

async function init() {
  const args: string[] = process.argv.slice(2);

  let state: State;
  try {
    const fileContent: string =
      await fs.readFile(path.join(process.cwd(), 'todos.json'), 'utf-8');
    state = JSON.parse(fileContent);
  } catch (err) {
    state = { todos: [] };
  }

  const saveAndRender = () => {
    saveFile(
      state,
      path.join(process.cwd(), 'todos.json'),
      () => showMenu(state, false, saveAndRender)
    );
  };

  const saveAndRenderExecuteMessage = (message: string): void => {
    saveFile(state, path.join(process.cwd(), 'todos.json'), () => {
      console.log(message);
      readlineInterface.close();
    });
  };

  const handleExecuteError = (message: string): void => {
    console.log(message);
    readlineInterface.close();
  };

  const flag: string = args[0];
  if (flag === '-c' || flag === '--create') { // Create
    const title: string = args.slice(1).join(' ');
    if (title === undefined) return console.log('Must provide a title');

    createTodo(state, title, {
      onSuccess: () => saveAndRenderExecuteMessage('Created Successfully')
    });
  } else if (flag === '-ls' || flag === '--list') { // Read
    showTodos(state);
    readlineInterface.close();
  } else if (flag === '-u' || flag === '--update') { // Update
    const id: string | undefined = args[1];
    if (id === undefined) return console.log('Must provide an id');

    toggleTodo(state, id, {
      onSuccess: () => saveAndRenderExecuteMessage('Updated Successfully'),
      onError: handleExecuteError
    });
  } else if (flag === '-r' || flag === '--remove') { // Delete
    const id: string | undefined = args[1];
    if (id === undefined) return console.log('Must provide an id');

    removeTodo(state, id, {
      onSuccess: () => saveAndRenderExecuteMessage('Removed Successfully'),
      onError: handleExecuteError
    });
  } else if (flag === '-h' || flag === '--help') { // help flag
    showHelpMessage();
    readlineInterface.close();
  } else if (flag === '-it') { // Interactive mode
    showMenu(state, true, saveAndRender);
  } else { // unfamiliar flags
    console.log('unfamiliar with the commands? use the -h or --help flag for help\n');
    readlineInterface.close();
  }
}

init().catch(console.log);
