// PostgreSQL-backed application API and local media server.
import http from 'node:http';
import bcrypt from 'bcryptjs';
import { createReadStream } from 'node:fs';
import { stat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { pool, query } from './database.js';
import { listLandmarks, getLandmark } from './landmark-repository.js';
import { storageRoot, validateStorageKey } from './storage.js';
import {
  addBusConnection,
  createManagerAccount,
  getAdminBootstrap,
  removeBusConnection,
  reviewLatestProposal,
  setManagerStatus,
  updateLandmark,
  updateManagerAccount,
} from './admin-repository.js';
import {
  getManagerWorkspace,
  submitManagerProposal,
} from './manager-repository.js';
import { createTokenService } from '../../functions/src/services/tokenService.js';
import { AUTH_ERROR_CODES } from '../../shared/constants/auth.js';
import { getFeaturesForUserType, USER_TYPES } from '../../shared/constants/roles.js';
import { recordPing, recordAudioPlay, getAnalyticsData } from './analytics-service.js';
const port=Number(process.env.DB_API_PORT ?? 3002);
if (!Number.isInteger(port) || port<1 || port>65535) throw new Error('Invalid DB_API_PORT');
const allowedOrigin=process.env.DB_API_CORS_ORIGIN ?? 'http://localhost:5173';
const tokens=createTokenService(process.env.AUTH_SECRET ?? 'dev-only-secret-change-me');
if (!process.env.AUTH_SECRET) console.warn('AUTH_SECRET is not set; configure a private random secret before deployment.');
const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const types={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp',
  '.mp3':'audio/mpeg','.m4a':'audio/mp4','.ogg':'audio/ogg','.wav':'audio/wav'};
function sendJson(res,status,body) {
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});
  res.end(JSON.stringify(body));
}
async function readJson(req) {
  const chunks=[];
  let size=0;
  for await (const chunk of req) {
    size+=chunk.length;
    if (size>1024*1024) throw Object.assign(new Error('Request body too large'),{status:413});
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('Invalid JSON body'),{status:400}); }
}
async function authenticatedAdmin(req) {
  const authorization=req.headers.authorization;
  const token=authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  let payload;
  try { payload=tokens.verify(token); } catch { return null; }
  if (!payload?.sub) return null;
  const { rows }=await query(`SELECT user_id,role,is_active
    FROM public.users WHERE user_id=$1`,[payload.sub]);
  const user=rows[0];
  return user?.role==='ADMIN' && user.is_active ? user : null;
}
async function authenticatedManager(req) {
  const authorization=req.headers.authorization;
  const token=authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  let payload;
  try { payload=tokens.verify(token); } catch { return null; }
  if (!payload?.sub || !uuidPattern.test(payload.sub)) return null;
  const { rows }=await query(`SELECT user_id,username,landmark_id
    FROM public.users WHERE user_id=$1 AND role='MANAGER' AND is_active`,[payload.sub]);
  return rows[0] ?? null;
}
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
  const origin = req.headers.origin;
  const isAllowed = origin && (
    origin === allowedOrigin ||
    /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin)
  );
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Authorization');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
  }
  if (req.method==='OPTIONS') {res.writeHead(204);res.end();return;}
  if (!['GET','HEAD','POST','PATCH','DELETE'].includes(req.method)) {
    sendJson(res,405,{error:'Method not allowed'});return;
  }
  try {
    const url=new URL(req.url,'http://localhost');
    if (url.pathname.startsWith('/media/')) {await serveMedia(req,res,url.pathname);return;}
    if (req.method==='HEAD') {res.writeHead(405);res.end();return;}
    if (req.method==='POST' && url.pathname==='/api/analytics/ping') {
      const body = await readJson(req);
      if (typeof body?.sessionId !== 'string' || typeof body?.visitorId !== 'string'
          || !/^[a-zA-Z0-9_-]{8,100}$/.test(body?.sessionId ?? '')
          || !/^[a-zA-Z0-9_-]{8,100}$/.test(body?.visitorId ?? '')
          || !['web','mobile'].includes(body?.platform)
          || typeof body?.active !== 'boolean') {
        sendJson(res,400,{error:'Valid sessionId, visitorId, platform and active are required'});return;
      }
      sendJson(res,200,{ok:true,activeUsers:await recordPing(body)});return;
    }
    if (req.method==='POST' && url.pathname==='/api/analytics/play') {
      const body = await readJson(req);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body?.landmarkId ?? '')
          || !['vi','en'].includes(body?.lang)
          || (body?.visitorId != null && !uuidPattern.test(body.visitorId))) {
        sendJson(res,400,{error:'Valid landmarkId and lang are required'});return;
      }
      const saved = await recordAudioPlay(body);
      sendJson(res,saved ? 201 : 404,saved ? {ok:true} : {error:'Landmark not found'});return;
    }
    if (req.method==='GET' && url.pathname==='/api/analytics/stats') {
      if (!await authenticatedAdmin(req)) {sendJson(res,401,{error:'Admin authentication required'});return;}
      sendJson(res,200,{data:await getAnalyticsData()});return;
    }
    if (req.method==='POST' && url.pathname==='/api/analytics/visitors') {
      const body=await readJson(req);
      const visitorId=String(body?.visitorId ?? '');
      if (!uuidPattern.test(visitorId)) {sendJson(res,400,{error:'A valid visitorId is required'});return;}
      await query(`INSERT INTO public.analytics_visitors(visitor_id)
        VALUES ($1)
        ON CONFLICT (visitor_id) DO UPDATE SET last_seen_at=now()`,[visitorId]);
      sendJson(res,201,{ok:true});return;
    }
    if (req.method==='POST' && url.pathname==='/api/analytics/listens') {
      const body=await readJson(req);
      const visitorId=String(body?.visitorId ?? '');
      const landmarkId=String(body?.landmarkId ?? '');
      const language=String(body?.language ?? '');
      if (!uuidPattern.test(visitorId) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(landmarkId)
          || !['vi','en'].includes(language)) {
        sendJson(res,400,{error:'A valid visitorId, landmarkId and language are required'});return;
      }
      const {rowCount}=await query(`WITH selected_landmark AS (
          SELECT landmark_id FROM public.landmarks WHERE landmark_id=$2
        ), visitor AS (
          INSERT INTO public.analytics_visitors(visitor_id)
          SELECT $1 WHERE EXISTS (SELECT 1 FROM selected_landmark)
          ON CONFLICT (visitor_id) DO UPDATE SET last_seen_at=now()
          RETURNING visitor_id
        )
        INSERT INTO public.audio_listens(visitor_id,landmark_id,language)
        SELECT visitor.visitor_id,selected_landmark.landmark_id,$3
        FROM visitor CROSS JOIN selected_landmark`,[visitorId,landmarkId,language]);
      if (!rowCount) {sendJson(res,404,{error:'Landmark not found'});return;}
      sendJson(res,201,{ok:true});return;
    }
    if (req.method==='POST' && url.pathname==='/api/auth/login') {
      const body=await readJson(req);
      const username=String(body?.unfid ?? '').trim().toLowerCase();
      const password=String(body?.password ?? '');
      if (!username || !password) {
        sendJson(res,400,{error:{code:AUTH_ERROR_CODES.INVALID_REQUEST,message:'Username and password are required'}});return;
      }
      const { rows }=await query(`SELECT u.user_id,u.username,u.password_hash,u.role,u.is_active,l.title_vi
        FROM public.users u LEFT JOIN public.landmarks l ON l.landmark_id=u.landmark_id
        WHERE u.username=$1`,[username]);
      const user=rows[0];
      if (!user || !user.is_active) {
        sendJson(res,401,{error:{code:AUTH_ERROR_CODES.UNFID_NOT_FOUND,message:'Account not found'}});return;
      }
      if (!(await bcrypt.compare(password,user.password_hash))) {
        sendJson(res,401,{error:{code:AUTH_ERROR_CODES.WRONG_PASSWORD,message:'Incorrect password'}});return;
      }
      const userType=user.role==='ADMIN' ? USER_TYPES.ADMIN : USER_TYPES.MANAGER;
      const expiresAt=Date.now()+30*60*1000;
      sendJson(res,200,{
        token:tokens.sign({sub:user.user_id,userType,exp:expiresAt}),
        expiresAt,
        user:{unfid:user.username,name:user.role==='ADMIN'?'Quản trị viên':`Ban quản lý ${user.title_vi}`,userType},
        features:getFeaturesForUserType(userType),
      });
      return;
    }
    if (url.pathname.startsWith('/api/manager/')) {
      const manager=await authenticatedManager(req);
      if (!manager) {sendJson(res,401,{error:'Manager authentication required'});return;}
      if (req.method==='GET' && url.pathname==='/api/manager/workspace') {
        sendJson(res,200,{data:await getManagerWorkspace(manager.user_id)});return;
      }
      if (req.method==='POST' && url.pathname==='/api/manager/proposals') {
        const proposal=await submitManagerProposal(manager.user_id,await readJson(req));
        sendJson(res,201,{data:proposal});return;
      }
      sendJson(res,404,{error:'Not found'});return;
    }
    if (url.pathname.startsWith('/api/admin/')) {
      const admin=await authenticatedAdmin(req);
      if (!admin) {sendJson(res,401,{error:'Admin authentication required'});return;}
      if (req.method==='GET' && url.pathname==='/api/admin/bootstrap') {
        sendJson(res,200,{data:await getAdminBootstrap()});return;
      }
      if (req.method==='POST' && url.pathname==='/api/admin/accounts') {
        await createManagerAccount(await readJson(req));
        sendJson(res,201,{ok:true});return;
      }
      const accountMatch=url.pathname.match(/^\/api\/admin\/accounts\/([0-9a-f-]+)(?:\/status)?$/i);
      if (accountMatch && !uuidPattern.test(accountMatch[1])) {
        sendJson(res,400,{error:'Invalid account ID'});return;
      }
      if (accountMatch && req.method==='PATCH' && url.pathname.endsWith('/status')) {
        const body=await readJson(req);
        if (typeof body.active!=='boolean') {sendJson(res,400,{error:'active must be a boolean'});return;}
        await setManagerStatus(accountMatch[1],body.active);sendJson(res,200,{ok:true});return;
      }
      if (accountMatch && req.method==='PATCH') {
        await updateManagerAccount(accountMatch[1],await readJson(req));
        sendJson(res,200,{ok:true});return;
      }
      const landmarkMatch=url.pathname.match(/^\/api\/admin\/landmarks\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:\/(buses|review))?$/);
      if (req.method==='PATCH' && landmarkMatch && !landmarkMatch[2]) {
        await updateLandmark(landmarkMatch[1],await readJson(req));sendJson(res,200,{ok:true});return;
      }
      if (req.method==='POST' && landmarkMatch?.[2]==='buses') {
        await addBusConnection(landmarkMatch[1],await readJson(req));sendJson(res,201,{ok:true});return;
      }
      if (req.method==='POST' && landmarkMatch?.[2]==='review') {
        const body=await readJson(req);
        if (!uuidPattern.test(String(body.proposalId ?? '')) || typeof body.accepted!=='boolean') {
          sendJson(res,400,{error:'proposalId and accepted are required'});return;
        }
        await reviewLatestProposal(landmarkMatch[1],body.proposalId,admin.user_id,body.accepted);
        sendJson(res,200,{ok:true});return;
      }
      const busMatch=url.pathname.match(/^\/api\/admin\/bus-connections\/([0-9a-f-]+)$/i);
      if (req.method==='DELETE' && busMatch) {
        if (!uuidPattern.test(busMatch[1])) {sendJson(res,400,{error:'Invalid bus connection ID'});return;}
        await removeBusConnection(busMatch[1]);sendJson(res,200,{ok:true});return;
      }
      sendJson(res,404,{error:'Not found'});return;
    }
    if (req.method!=='GET') {sendJson(res,405,{error:'Method not allowed'});return;}
    if (url.pathname==='/health/db' || url.pathname==='/api/health') {
      await query('SELECT 1');sendJson(res,200,{ok:true});return;
    }
    const language=url.searchParams.get('lang') ?? 'vi';
    if (!['vi','en'].includes(language)) {sendJson(res,400,{error:'Supported languages: vi, en'});return;}
    if (url.pathname==='/api/landmarks' || url.pathname==='/api/places') {
      sendJson(res,200,{data:await listLandmarks(language),success:true});return;
    }
    const match=url.pathname.match(/^\/api\/landmarks\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
    if (match) {
      const item=await getLandmark(match[1],language);
      sendJson(res,item?200:404,item?{data:item}:{error:'Landmark not found'});return;
    }
    sendJson(res,404,{error:'Not found'});
  } catch(error) {
    const status=error.status ?? (error.code==='23505' ? 409 : 500);
    console.error('API error:', error.code ?? error.name, error.message);
    sendJson(res,status,{error:status===500?'Database request failed':error.message});
  }
});
server.listen(port,'0.0.0.0',()=>console.log(`Demo API: http://localhost:${port}`));
let closing=false;
function shutdown(){if(closing)return;closing=true;server.close(async()=>{await pool.end();});}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
