export const sections=['basics','listening','reading','oral','writing'];
export const allSections=Object.fromEntries(sections.map(k=>[k,true]));
export const basicOnly={...allSections,listening:false,reading:false,oral:false,writing:false};
export const validPermissions=p=>p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).length===sections.length&&sections.every(k=>typeof p[k]==='boolean');
export function routeSection(page){return ({courses:'basics',course:'basics',material:'basics',articles:'basics',article:'basics',practice:'basics',review:'basics',listening:'listening',reading:'reading',oral:'oral',writing:'writing'})[page];}
