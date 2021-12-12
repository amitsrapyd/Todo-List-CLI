import fs from 'fs/promises';

export async function saveFile(state: any, filePath: string, onSuccess: Function): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(state), 'utf-8');

  onSuccess();
}
