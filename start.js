const http = require('http');
const { Client, Server } = require('./lib');

function createTarget() {
  return http.createServer((request, response) => {
    response.writeHead(200);
    response.write('hello world');
    response.end();
  });
}

(function main() {
  const target = createTarget();
  target.listen(3000);

  const server = new Server();
  server.listen({
    consumer: '3001',
    producer: '3002'
  });

  const client = new Client({
    endpoint: 'http://localhost:3002'
  });
  client.launch();
}());