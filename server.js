/*
 * Servidor estático mínimo (zero dependências).
 * Usado no Railway via "npm start" — serve a pasta site/ na porta do ambiente.
 * No Vercel não é usado: o vercel.json aponta outputDirectory para site/.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, 'site');
const PORT = process.env.PORT || 3000;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8'
};

const servidor = http.createServer((req, res) => {
  try {
    const url = decodeURIComponent(req.url.split('?')[0]);
    let alvo = path.normalize(path.join(ROOT, url === '/' ? 'index.html' : url));

    // não serve nada fora da pasta site/
    if (alvo !== ROOT && !alvo.startsWith(ROOT + path.sep)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('403');
    }
    if (fs.existsSync(alvo) && fs.statSync(alvo).isDirectory()) {
      alvo = path.join(alvo, 'index.html');
    }
    if (!fs.existsSync(alvo) || !fs.statSync(alvo).isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 - arquivo nao encontrado');
    }
    const tipo = TIPOS[path.extname(alvo).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': tipo });
    fs.createReadStream(alvo).pipe(res);
  } catch (erro) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('500 - ' + erro.message);
  }
});

servidor.listen(PORT, '0.0.0.0', () => {
  console.log('melhoriasshop: servindo site/ na porta ' + PORT);
});
