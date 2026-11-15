import {mkdir,readFile,writeFile} from 'node:fs/promises';import {randomBytes} from 'node:crypto';
await mkdir('.student-data',{recursive:true,mode:0o700});
const file='.student-data/admin-first-login.json';let credentials;
try{credentials=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;credentials={email:'dulaclyon07@gmail.com',password:randomBytes(18).toString('base64url')};await writeFile(file,JSON.stringify(credentials,null,2),{mode:0o600});}
process.env.ADMIN_EMAIL=credentials.email;process.env.ADMIN_PASSWORD=credentials.password;
console.log('Local administrator credentials: '+file+' (private file; never commit).');
await import('../server/server.mjs');
