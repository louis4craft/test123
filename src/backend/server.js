const http = require('http');

const server = http.createServer((req, res) => {
  // Hier deine Antwort generieren
});

server.listen(3000, () => {
  console.log('Server läuft auf Port 3000');
});