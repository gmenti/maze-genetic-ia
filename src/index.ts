import * as express from 'express';
import * as path from 'path';
import * as http from 'http';
import * as socketIO from 'socket.io';
import * as loader from './loader';

const app = express();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const server = http.createServer(app);

const io = socketIO(server);

io.on('connection', async socket => {
  console.log('user connected');
  const mazes = await loader.loadMazes();
  socket.emit('mazes', mazes);

  socket.on('start', async mazeIndex => {
    const maze = mazes[mazeIndex];
    const bestWay = await maze.findBestWay((best: any) => {
      socket.emit('best', {
        maze,
        bestWay: best,
        index: mazeIndex,
      });
    });
    socket.emit('result', {
      maze,
      bestWay,
      index: mazeIndex
    });
  });

  console.log('emitted mazes');
});

server.listen(1337, () => {
  console.log('Server started on port http://localhost:1337');
});

// setImmediate(async () => {
//   const mazes = await loader.loadMazes();

//   for (const maze of mazes) {
//     maze.findBestWay();
//     break;
//   }
// });
