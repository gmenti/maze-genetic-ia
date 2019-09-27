import express from 'express';
import path from 'path';
import * as loader from './loader';

const app = express();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
})

// setImmediate(async () => {
//   const mazes = await loader.loadMazes();
  
//   for (const maze of mazes) {
//     maze.findBestWay();
//     break;
//   }
// });
