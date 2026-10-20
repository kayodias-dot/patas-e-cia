import { openDatabase } from './database.mjs';
import { createApp } from './app.mjs';
const major = Number(process.versions.node.split('.')[0]);
if (major < 22) { console.error('Use Node.js 24 LTS (minimo 22.13).'); process.exit(1); }
const db = openDatabase();
const server = createApp(db);
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Porta ${port} ocupada. Defina PORT com outra porta.` : error.message); db.close(); process.exit(1); });
server.listen(port, host, () => {
  console.log(`\nPatas & Cia | http://localhost:${port}\nGestao: http://localhost:${port}/painel.html\nUse somente dados ficticios. Ctrl+C para encerrar.\n`);
});
function shutdown() {
  server.close(() => { db.close(); process.exit(0); });
  setTimeout(() => { server.closeAllConnections(); }, 2000).unref();
}
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
