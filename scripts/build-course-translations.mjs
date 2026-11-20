import {readFile,writeFile} from 'node:fs/promises';
const rows=JSON.parse(await readFile(new URL('../translations/course-content.json',import.meta.url),'utf8'));
const catalogue={};
for(const row of rows){
 if(!row.source||!row.en||!row['zh-TW'])throw Error('Incomplete course translation');
 if(catalogue[row.source])throw Error('Duplicate course phrase: '+row.source);
 const {source,...locales}=row;catalogue[source]=locales;
}
await writeFile(new URL('../course-translations.js',import.meta.url),'// Complete-phrase course translations. Original source editions remain in src/data.\nexport const courseTranslations = '+JSON.stringify(catalogue)+';\n');
console.log(`${rows.length} course translation phrases compiled.`);
