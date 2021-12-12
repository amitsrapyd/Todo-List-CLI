// module for parsing process.argv and using logic
import { createInterface, Interface } from 'readline';

export class ArgsParser {
  private readlineInterface: Interface = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  constructor() {
    this.readlineInterface.on('close', () => {
      process.exit(0);
    });
  }

  parse(args: string[]) {

  }
}
