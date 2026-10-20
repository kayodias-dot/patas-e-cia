import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase } from '../server/database.mjs';
import { createApp } from '../server/app.mjs';
let db,server,base,token,cookie,directory,file;
async function call(path,method='GET',body,headers={}) {
  const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json','X-CSRF-Token':token||'',Cookie:cookie||'',...headers},...(body!==undefined ? {body:typeof body==='string' ? body : JSON.stringify(body)} : {})});
  let payload;try{payload=await response.json();}catch{payload=null;}
  return {status:response.status,payload,headers:response.headers};
}
async function start() {
  db=openDatabase(file);server=createApp(db);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
  const response=await fetch(base+'/api/session');cookie=response.headers.get('set-cookie').split(';')[0];token=(await response.json()).data.csrf;
}
async function stop() {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));db.close();}
describe('HTTP API + real SQLite integration',{concurrency:false},()=>{
  before(async()=>{directory=mkdtempSync(join(tmpdir(),'patas-test-'));file=join(directory,'test.sqlite');await start();});
  after(async()=>{await stop();rmSync(directory,{recursive:true,force:true});});
  test('Health endpoint',async()=>assert.equal((await call('/api/health')).payload.data.status,'ok'));
  test('Starts with empty database',async()=>assert.equal((await call('/api/stats')).payload.data.tutores,0));
  test('Rejects write without CSRF',async()=>assert.equal((await call('/api/tutores','POST',{nome:'Teste Tutor',telefone:'85900000111'},{'X-CSRF-Token':''})).status,403));
  test('Rejects cross-origin write',async()=>assert.equal((await call('/api/tutores','POST',{nome:'Teste Tutor',telefone:'85900000111'},{Origin:'https://unrelated.example'})).status,403));
  test('Returns field errors for invalid phone',async()=>{
    const r=await call('/api/tutores','POST',{nome:'Teste Tutor',telefone:'123'});assert.equal(r.status,422);assert.ok(r.payload.error.fields.telefone);
  });
  test('Creates tutor with normalized data',async()=>{
    const r=await call('/api/tutores','POST',{nome:'Ana Exemplo',telefone:'(85) 90000-0111',email:'ana@example.com'});assert.equal(r.status,201);assert.equal(r.payload.data.id,1);assert.equal(r.payload.data.telefone,'85900000111');assert.equal(r.headers.get('location'),'/api/tutores/1');
  });
  test('Creates second tutor',async()=>assert.equal((await call('/api/tutores','POST',{nome:'Jo\u00e3o Modelo',telefone:'85900000222'})).status,201));
  test('Creates related animal',async()=>{
    const r=await call('/api/animais','POST',{nome:'Pa\u00e7oca',especie:'cao',tutor_id:1,raca:'Sem ra\u00e7a definida'});assert.equal(r.status,201);assert.equal(r.payload.data.tutor_nome,'Ana Exemplo');
  });
  test('Rejects animal referring to missing tutor',async()=>assert.equal((await call('/api/animais','POST',{nome:'Animal',especie:'gato',tutor_id:99999})).status,422));
  test('Blocks deletion of tutor with animals (409)',async()=>{
    const r=await call('/api/tutores/1','DELETE');assert.equal(r.status,409);assert.equal(r.payload.error.code,'TUTOR_HAS_ANIMALS');assert.equal((await call('/api/tutores/1')).status,200);
  });
  test('Database foreign key also blocks direct deletion',()=>assert.throws(()=>db.prepare('DELETE FROM tutores WHERE id=1').run(),/FOREIGN KEY/));
  test('Lists animals by tutor',async()=>{
    const r=await call('/api/animais?tutor_id=1');assert.equal(r.payload.meta.total,1);assert.equal(r.payload.data[0].nome,'Pa\u00e7oca');
  });
  test('Searches animal without accents',async()=>assert.equal((await call('/api/animais?q=pacoca')).payload.meta.total,1));
  test('Searches tutor without accents',async()=>assert.equal((await call('/api/tutores?q=joao')).payload.meta.total,1));
  test('Handles SQL-injection-like search as literal data',async()=>assert.equal((await call('/api/tutores?q='+encodeURIComponent("' OR 1=1 --"))).payload.meta.total,0));
  test('Escapes wildcard search',async()=>assert.equal((await call('/api/tutores?q=%25')).payload.meta.total,0));
  test('Supports pagination',async()=>{
    const r=await call('/api/tutores?page=2&limit=1');assert.equal(r.payload.meta.pages,2);assert.equal(r.payload.data.length,1);
  });
  test('Validates pagination limit',async()=>assert.equal((await call('/api/tutores?limit=5000')).status,400));
  test('Validates pagination syntax',async()=>assert.equal((await call('/api/tutores?page=1abc')).status,400));
  test('Validates species filter',async()=>assert.equal((await call('/api/animais?especie=invalid')).status,400));
  test('Rejects nonexistent tutor filter',async()=>assert.equal((await call('/api/animais?tutor_id=9999')).status,404));
  test('Updates tutor',async()=>{
    const r=await call('/api/tutores/1','PUT',{nome:'Ana Atualizada',telefone:'85900000111',bairro:'Centro'});assert.equal(r.status,200);assert.equal(r.payload.data.nome,'Ana Atualizada');
  });
  test('Updates and transfers animal to another tutor',async()=>{
    const r=await call('/api/animais/1','PUT',{nome:'Pa\u00e7oca Atualizado',especie:'cao',tutor_id:2,peso_kg:8.3});assert.equal(r.status,200);assert.equal(r.payload.data.tutor_id,2);
  });
  test('Now permits deletion of previous tutor',async()=>assert.equal((await call('/api/tutores/1','DELETE')).status,200));
  test('Returns not found for deleted tutor',async()=>assert.equal((await call('/api/tutores/1')).status,404));
  test('Persists records after restarting the server',async()=>{
    await stop();await start();const r=await call('/api/animais/1');assert.equal(r.status,200);assert.equal(r.payload.data.nome,'Pa\u00e7oca Atualizado');
  });
  test('Deletes animal and then its tutor',async()=>{
    assert.equal((await call('/api/animais/1','DELETE')).status,200);assert.equal((await call('/api/tutores/2','DELETE')).status,200);
  });
  test('Rejects malformed JSON',async()=>assert.equal((await call('/api/tutores','POST','{invalid}')).status,400));
  test('Rejects non-object JSON',async()=>assert.equal((await call('/api/tutores','POST',[])).status,400));
  test('Rejects non-JSON content type',async()=>assert.equal((await call('/api/tutores','POST','nome=Ana',{'Content-Type':'application/x-www-form-urlencoded'})).status,415));
  test('Rejects unsupported API method',async()=>assert.equal((await call('/api/tutores','PATCH',{})).status,405));
  test('Rejects oversized form',async()=>assert.equal((await call('/api/tutores','POST',{nome:'A'.repeat(30000)})).status,413));
  test('Does not expose database files',async()=>assert.equal((await call('/data/patas-e-cia.sqlite')).status,404));
  test('Does not expose server source',async()=>assert.equal((await call('/server/index.mjs')).status,404));
  test('Does not expose environment configuration',async()=>assert.equal((await call('/.env')).status,404));
  test('Serves HTML with protective headers',async()=>{
    const r=await fetch(base+'/');assert.equal(r.status,200);assert.equal(r.headers.get('x-content-type-options'),'nosniff');assert.ok(r.headers.get('content-security-policy'));assert.match(await r.text(),/Patas/);
  });
});
