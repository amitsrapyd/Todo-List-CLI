import { Interface } from 'readline';

export function readLine(readlineInterface: Interface, questions: string): Promise<string> {
  return new Promise(resolve => {
    readlineInterface.question(questions, answer => {
      resolve(answer);
    });
  });
}
