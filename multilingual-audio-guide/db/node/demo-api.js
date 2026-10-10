// Read-only local demo. No account, upload or approval endpoint is exposed.
import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { pool, query } from './database.js';
import { listLandmarks, getLandmark } from './landmark-repository.js';
import { storageRoot, validateStorageKey } from './storage.js';
const port=Number(process.env.DB_API_PORT ?? 3002);
if (!Number.isInteger(port) || port<1 || port>65535) throw new Error('Invalid DB_API_PORT');
const allowedOrigin=process.env.DB_API_CORS_ORIGIN ?? 'http://localhost:5173';
const types={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp',
  '.mp3':'audio/mpeg','.m4a':'audio/mp4','.ogg':'audio/ogg','.wav':'audio/wav'};
async function serveMedia(req,res,pathname) {
  if ((process.env.STORAGE_MODE ?? 'local') !== 'local') { res.writeHead(404); res.end(); return; }
  let file,info;
  try {
    const key=validateStorageKey(decodeURIComponent(pathname.slice('/media/'.length)));
    const root=await realpath(storageRoot);
    file=await realpath(path.join(root,...key.split('/')));
    const relative=path.relative(root,file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Outside storage');
    info=await stat(file);
    if (!info.isFile()) throw new Error('Not a file');
  } catch { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type',types[path.extname(file)] ?? 'application/octet-stream');
  res.setHeader('Accept-Ranges','bytes');
  let start=0,end=info.size-1,status=200;
  if (req.headers.range) {
    const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (!match || (!match[1] && !match[2]) || info.size===0) {
      res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;
    }
    if (match[1]) { start=Number(match[1]); end=match[2] ? Math.min(Number(match[2]),end) : end; }
    else { start=Math.max(0,info.size-Number(match[2])); }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start>end || start>=info.size) {
      res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;
    }
    status=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${info.size}`);
  }
  res.setHeader('Content-Length',info.size===0 ? 0 : end-start+1);
  res.writeHead(status);
  if (req.method==='HEAD' || info.size===0) {res.end();return;}
  const stream=createReadStream(file,{start,end});
  stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
}
const server=http.createServer(async (req,res)=>{
  if (req.headers.origin===allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin',allowedOrigin);res.setHeader('Vary','Origin');
    res.setHeader('Access-Control-Allow-Methods','GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Range');
    res.setHeader('Access-Control-Expose-Headers','Content-Length, Content-Range, Accept-Ranges');
  }
  const send=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(body));};
  if (req.method==='OPTIONS') {res.writeHead(204);res.end();return;}
  if (!['GET','HEAD'].includes(req.method)) {send(405,{error:'Method not allowed'});return;}
  try {
    const url=new URL(req.url,'http://localhost');
    if (url.pathname.startsWith('/media/')) {await serveMedia(req,res,url.pathname);return;}
    if (req.method==='HEAD') {res.writeHead(405);res.end();return;}
    if (url.pathname==='/health/db') {await query('SELECT 1');send(200,{ok:true});return;}
    const language=url.searchParams.get('lang') ?? 'vi';
    if (!['vi','en'].includes(language)) {send(400,{error:'Supported languages: vi, en'});return;}
    if (url.pathname==='/api/landmarks') {send(200,{data:await listLandmarks(language)});return;}
    const match=url.pathname.match(/^\/api\/landmarks\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
    if (match) {
      const item=await getLandmark(match[1],language);
      send(item?200:404,item?{data:item}:{error:'Landmark not found'});return;
    }
    send(404,{error:'Not found'});
  } catch(error) {console.error('API error:',error.code ?? error.name);send(500,{error:'Database request failed'});}
});
server.listen(port,'0.0.0.0',()=>console.log(`Demo API: http://localhost:${port}`));
let closing=false;
function shutdown(){if(closing)return;closing=true;server.close(async()=>{await pool.end();});}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
