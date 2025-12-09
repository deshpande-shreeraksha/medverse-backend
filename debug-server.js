import express from 'express';
const app = express();
const PORT = 5000;

app.get('/', (req, res) => res.send('test'));

console.log('Creating server...');
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('ERROR on server:', err.code, err.message);
  process.exit(1);
});

console.log('Waiting...');
setInterval(() => {
  console.log('Alive at', new Date().toISOString());
}, 5000);
