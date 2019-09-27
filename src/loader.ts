import * as fs from 'fs';
import * as path from 'path';
import { Maze } from './types';

const assetsPath = path.join(__dirname, '../assets');

const mazeFiles = [
  'labirinto1_10.txt',
  'labirinto2_10.txt',
  'labirinto3_20.txt',
  'labirinto4_20.txt',
];

export const loadMazes = (): Promise<Maze[]> => Promise.all(mazeFiles.map((filename) => {
  return new Promise((resolve, reject) => {
    const filepath = path.join(assetsPath, filename);
    fs.readFile(filepath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        const [_, ...dirtyRows]: string[] = data.toString().split('\n').filter(row => row.length);
        const rows = dirtyRows.map(row => row.split(' ').filter(v => v.length));
        resolve(new Maze(rows));
      }
    });
  });
}));
