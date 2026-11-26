import {sections,allSections,normalizePermissions} from './section-permissions.mjs';
export function addAccessMonths(at,months){const date=new Date(at),day=date.getUTCDate();date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()+months);const last=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();date.setUTCDate(Math.min(day,last));return date.getTime();}
export function validAccessMonths(value){return value===undefined||(value&&typeof value==='object'&&!Array.isArray(value)&&Object.entries(value).every(([key,v])=>sections.includes(key)&&(v==='keep'||Number.isInteger(v)&&v>=1&&v<=36)));}
export function accessExpiry(db,now=Date.now){
 db.exec('CREATE TABLE IF NOT EXISTS permission_expiry(user_id TEXT PRIMARY KEY,value TEXT NOT NULL)');
 const assigned=id=>normalizePermissions(JSON.parse(db.prepare('SELECT value FROM permissions WHERE user_id=?').get(id)?.value||JSON.stringify(allSections)));
 const expires=id=>JSON.parse(db.prepare('SELECT value FROM permission_expiry WHERE user_id=?').get(id)?.value||'{}');
 function effective(user){if(['owner','admin','teacher','guest'].includes(user.role))return allSections;const p=assigned(user.id),dates=expires(user.id);return Object.fromEntries(sections.map(k=>[k,p[k]&&(!dates[k]||dates[k]>now())]));}
 function apply(id,permissions,months,{newGrant=false}={}){const previous=newGrant?{}:assigned(id),dates=expires(id),at=now();for(const key of sections){if(!permissions[key])delete dates[key];else if(Number.isInteger(months?.[key]))dates[key]=addAccessMonths(Math.max(at,dates[key]||0),months[key]);else if(!previous[key])dates[key]=addAccessMonths(at,1);}
 db.prepare('INSERT INTO permissions VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET value=excluded.value').run(id,JSON.stringify(permissions));db.prepare('INSERT INTO permission_expiry VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET value=excluded.value').run(id,JSON.stringify(dates));return dates;}
 return {assigned,expires,effective,apply};
}
