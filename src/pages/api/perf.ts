import fs from 'fs';
import path from 'path';

export async function post({ request }){
  try{
    const body = await request.json();
    const logDir = path.join(process.cwd(),'logs');
    if(!fs.existsSync(logDir)) fs.mkdirSync(logDir,{recursive:true});
    const line = JSON.stringify({t:new Date().toISOString(), ...body}) + '\n';
    fs.appendFileSync(path.join(logDir,'perf.log'), line);
    return new Response(JSON.stringify({ok:true}), {status:200});
  }catch(e){
    return new Response(JSON.stringify({ok:false,error:String(e)}), {status:500});
  }
}
