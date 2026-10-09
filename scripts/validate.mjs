import fs from 'node:fs';import assert from 'node:assert/strict';import{buildBank,prepareSession,norm}from'../src/engine.js';
const p=JSON.parse(fs.readFileSync(new URL('../src/data/products.json',import.meta.url)));const b=buildBank(p);
assert.equal(p.length,59);assert.equal(new Set(b.map(q=>q.id)).size,b.length);
for(const q of b){assert.equal(q.options.length,4,q.id);assert.equal(new Set(q.options.map(norm)).size,4,q.id);assert.equal(q.options.filter(x=>x===q.answer).length,1,q.id);assert(q.evidence.length);}
for(const x of p)assert(b.some(q=>q.productId===x.id),'Uncovered '+x.titleRu);
const s=prepareSession(b);assert.equal(s.length,b.length);assert.deepEqual(new Set(s.map(q=>q.id)),new Set(b.map(q=>q.id)));
console.log(JSON.stringify({products:p.length,sourceRows:p.reduce((a,x)=>a+x.techSpecs.length,0),questions:b.length,detail:b.filter(x=>x.kind==='detail').length,configuration:b.filter(x=>x.kind==='configuration').length,catalog:b.filter(x=>x.kind==='catalog').length,minimumPerProduct:Math.min(...p.map(x=>b.filter(q=>q.productId===x.id).length)),checks:'PASS: coverage, unique IDs, four distinct options, one correct answer, evidence, shuffle'}));
