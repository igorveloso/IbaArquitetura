import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = process.cwd();
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.css': 'text/css' };

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && (req.url || '').startsWith('/save')) {
    const name = (new URL(req.url, 'http://x').searchParams.get('name') || 'shot.png').replace(/[^a-zA-Z0-9._-]/g, '');
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', async () => {
      const b64 = body.replace(/^data:image\/png;base64,/, '');
      await writeFile(join(ROOT, name), Buffer.from(b64, 'base64'));
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('saved ' + b64.length);
    });
    return;
  }
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = normalize(join(ROOT, p));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end('no'); return; }
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('not found');
  }
});
server.listen(8124, '127.0.0.1', () => console.log('save-server on http://127.0.0.1:8124'));
