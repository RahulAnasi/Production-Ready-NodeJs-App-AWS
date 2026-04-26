const http = require('http');

const server = http.createServer((req, res) => {
  res.end('Hello from My DevOps Project. We just started. Be right back!');
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});
