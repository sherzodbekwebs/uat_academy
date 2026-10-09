export const API='https://api.uzautotrailer.uz/products';
export const norm=s=>String(s??'').trim().toLowerCase().replace(/ё/g,'е').replace(/[×х]/g,'x').replace(/\s+/g,' ');
export function shuffle(a,rng=Math.random){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
const clean=s=>String(s??'').trim();
const fingerprint=s=>norm(s).replace(/\s+/g,'').replace(/,/g,'.');
const unique=a=>[...new Map(a.filter(Boolean).map(v=>[fingerprint(v),v])).values()];
const group=s=>norm(s.section?.titleRu)+'|'+norm(s.keyRu).replace(/[, ].*(кг|мм|л|м3).*$/,'');
function numericDecoys(value){
 const matches=[...value.matchAll(/\d+(?:[.,]\d+)?/g)];if(!matches.length)return [];
 const m=matches[0],n=Number(m[0].replace(',','.'));if(!Number.isFinite(n)||n<=0)return [];
 // Preserve original wording and format so the answer is not exposed by length or units.
 return [.9,1.1,.8,1.2,.95,1.05].map(f=>{let v=Number((n*f).toFixed(m[0].includes('.')||m[0].includes(',')?2:0));if(v===n)v+=1;let t=String(v);if(m[0].includes(','))t=t.replace('.',',');return value.slice(0,m.index)+t+value.slice(m.index+m[0].length);});
}
export function buildBank(products){
 const pools=new Map();for(const p of products)for(const s of p.techSpecs||[]){let k=group(s);pools.set(k,[...(pools.get(k)||[]),{p,s}]);}
 const questions=[];
 for(const p of products){
  const specs=(p.techSpecs||[]).filter(s=>clean(s.valRu)&&clean(s.keyRu));
  const seen=new Set();
  for(const s of specs){
   const answer=clean(s.valRu),key=group(s),sig=key+'|'+fingerprint(answer);if(seen.has(sig))continue;seen.add(sig);
   // Other catalog entries with the same field AND technical section, never unrelated dimensions.
   let candidates=(pools.get(key)||[]).filter(x=>x.p.id!==p.id).map(x=>clean(x.s.valRu));
   candidates=unique(candidates).filter(v=>fingerprint(v)!==fingerprint(answer));
   candidates.sort((a,b)=>Math.abs(a.length-answer.length)-Math.abs(b.length-answer.length));
   const alternatives=unique([...candidates.slice(0,8),...numericDecoys(answer)]).filter(v=>fingerprint(v)!==fingerprint(answer));
   if(alternatives.length<3)continue;
   const options=[answer,...alternatives.slice(0,3)];
   questions.push({id:p.id+':'+s.id,productId:p.id,section:s.section?.titleRu||'Texnik ma’lumot',kind:'detail',prompt:`${s.section?.titleRu||'Texnik jadval'} bo‘limidagi «${s.keyRu}» ko‘rsatkichi qaysi variantda to‘g‘ri berilgan?`,answer,options,explanation:`${p.titleRu}: «${s.keyRu}» — ${answer}.`,evidence:[{section:s.section?.titleRu,key:s.keyRu,value:answer}],source:`techSpecs / ${s.id}`});
  }
  // Configuration questions use paired facts with identically shaped distractors.
  const useful=specs.filter(s=>clean(s.valRu).length<90 && /мощност|формул|объем|объём|размер шин|высота|модель двигателя|нагрузка|масса/.test(norm(s.keyRu)));
  for(let i=0;i+1<useful.length;i+=2){const a=useful[i],b=useful[i+1];const av=clean(a.valRu),bv=clean(b.valRu);
   const da=unique([...(pools.get(group(a))||[]).map(x=>clean(x.s.valRu)),...numericDecoys(av)]).find(v=>fingerprint(v)!==fingerprint(av));
   const db=unique([...(pools.get(group(b))||[]).map(x=>clean(x.s.valRu)),...numericDecoys(bv)]).find(v=>fingerprint(v)!==fingerprint(bv));
   if(!da||!db)continue;const pair=(x,y)=>`${a.keyRu}: ${x} · ${b.keyRu}: ${y}`;
   questions.push({id:p.id+':pair:'+i,productId:p.id,section:'Komplektatsiya',kind:'configuration',prompt:'Mijozga ikkita ko‘rsatkichni birga aytish kerak. Qaysi juftlik ushbu modelning texnik jadvaliga to‘liq mos?',answer:pair(av,bv),options:[pair(av,bv),pair(da,bv),pair(av,db),pair(da,db)],explanation:'Juftlikdagi ikkala ko‘rsatkich ham bir vaqtda to‘g‘ri bo‘lishi kerak.',evidence:[{section:a.section?.titleRu,key:a.keyRu,value:av},{section:b.section?.titleRu,key:b.keyRu,value:bv}],source:`techSpecs / ${a.id}, ${b.id}`});
  }
  if(!specs.length){
   const cat=clean(p.category?.titleRu);const other=unique(products.map(x=>clean(x.category?.titleRu))).filter(x=>x!==cat);
   if(other.length>=3)questions.push({id:p.id+':category',productId:p.id,section:'Katalog',kind:'catalog',prompt:'API katalogida bu model qaysi texnika toifasiga kiritilgan?',answer:cat,options:[cat,...other.slice(0,3)],explanation:'Bu modelning texnik jadvali API’da bo‘sh. Toifa mavjud katalog ma’lumotidan olindi.',evidence:[{section:'Katalog',key:'category.titleRu',value:cat}],source:'category.titleRu'});
   const wheel=clean(p.titleRu).match(/[468]\s*[хx×]\s*[2468]/i)?.[0];if(wheel){const w=wheel.replace(/\s/g,'').replace(/[х×]/g,'x');questions.push({id:p.id+':wheel',productId:p.id,section:'Model nomi',kind:'catalog',prompt:'API’dagi model nomida qaysi g‘ildirak formulasi ko‘rsatilgan?',answer:w,options:unique([w,...['4x2','4x4','6x4','6x6','8x4'].filter(x=>x!==w)]).slice(0,4),explanation:'Bu savol texnik jadvaldan emas, API’dagi model nomidan tuzilgan.',evidence:[{section:'Katalog',key:'titleRu',value:p.titleRu}],source:'titleRu'});}
  }
 }
 return questions;
}
export function prepareSession(bank){return shuffle(bank).map(q=>({...q,options:shuffle(q.options)}));}
export function audit(products){return products.flatMap(p=>{
 const issues=[];if(!(p.techSpecs||[]).length)issues.push({productId:p.id,title:p.titleRu,message:'Texnik jadval bo‘sh: batafsil texnik savollar uchun ma’lumot yetarli emas.'});
 const specs=p.techSpecs||[];const groups=new Map();for(const s of specs){const k=norm(s.keyRu);groups.set(k,[...(groups.get(k)||[]),s]);}
 for(const [k,ss] of groups)if(k!=='тип'&&k!=='модель'&&k!=='особенности'&&unique(ss.map(s=>clean(s.valRu))).length>1)issues.push({productId:p.id,title:p.titleRu,message:`«${ss[0].keyRu}» maydonida turli qiymatlar: ${ss.map(s=>`${s.section?.titleRu}: ${s.valRu}`).join(' / ')}. Savollar aniq bo‘limga bog‘langan.`});
 if(p.slug==='kamaz-54901-sedelnyy-tyagach-4x2')issues.push({productId:p.id,title:p.titleRu,message:'Bak hajmi: techSpecs va tavsifda 1300 l, advantages matnida 1400 l. Test techSpecs qiymatini so‘raydi. Kabina bo‘limidagi ayrim UZ/EN qiymatlar RU bilan mazmunan mos emas; savollar RU jadvaliga asoslangan.'});
 return issues;
 });}
