const http = require('http');
const app = require('./app');

const port = process.ENV || 3000;

app.set('port', port);
const server = http.createServer(app);  //server.listen() vs app.listen()? not much diff

server.listen(port, () => {
    console.log(`Server is up!`);
  });
  