import * as http from 'http';
let server: http.Server;

export const closeServer = () => server && server.close();

export const startServer = () => server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end(JSON.stringify({
    result: {
      method: req.method,
      url: req.url,
    },
    success: true,
  }));
}).listen(8000);
