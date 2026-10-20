import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateTutor, validateAnimal, normalizePhone, normalize, ValidationError } from '../public/js/validation.mjs';
const tutor = {nome:'Marina Exemplo',telefone:'(85) 90000-0101',email:'marina@example.com'};
const animal = {nome:'Bento',tutor_id:1,especie:'cao'};
test('Tutor: normalizes phone, trims text and ignores unknown fields',()=>{
  const result=validateTutor({...tutor,nome:' Marina Exemplo ',intruso:'ignore'});
  assert.equal(result.nome,'Marina Exemplo');assert.equal(result.telefone,'85900000101');assert.equal(result.intruso,undefined);
});
test('Phone: landline with DDD',()=>assert.equal(normalizePhone('(85) 3000-0101'),'8530000101'));
test('Phone: international +55 format',()=>assert.equal(normalizePhone('+55 (85) 90000-0101'),'85900000101'));
for(const value of ['','123','texto','(00) 90000-0101','8599999999','859000000000','85<900000101']) test(`Phone: rejects ${JSON.stringify(value)}`,()=>assert.throws(()=>validateTutor({...tutor,telefone:value}),ValidationError));
test('Tutor: required name and phone',()=>{
  try {validateTutor({});assert.fail('Expected validation failure');}catch(error){assert.ok(error.fields.nome);assert.ok(error.fields.telefone);}
});
test('Tutor: rejects malformed email',()=>assert.throws(()=>validateTutor({...tutor,email:'x@'}),ValidationError));
test('Tutor: accepts empty optional fields',()=>assert.equal(validateTutor({...tutor,email:''}).email,''));
test('Tutor: rejects object as name',()=>assert.throws(()=>validateTutor({...tutor,nome:{}}),ValidationError));
test('Tutor: rejects excessive length',()=>assert.throws(()=>validateTutor({...tutor,nome:'A'.repeat(121)}),ValidationError));
test('Animal: accepts minimal valid record',()=>{
  const result=validateAnimal(animal);assert.equal(result.sexo,'nao_informado');assert.equal(result.peso_kg,null);assert.equal(result.data_nascimento,null);
});
test('Animal: accepts decimal comma',()=>assert.equal(validateAnimal({...animal,peso_kg:'4,25'}).peso_kg,4.25));
test('Animal: rejects empty name',()=>assert.throws(()=>validateAnimal({...animal,nome:''}),ValidationError));
test('Animal: rejects absent tutor',()=>assert.throws(()=>validateAnimal({...animal,tutor_id:''}),ValidationError));
test('Animal: rejects array as tutor',()=>assert.throws(()=>validateAnimal({...animal,tutor_id:[1]}),ValidationError));
test('Animal: rejects invalid species',()=>assert.throws(()=>validateAnimal({...animal,especie:'dinossauro'}),ValidationError));
test('Animal: rejects zero weight',()=>assert.throws(()=>validateAnimal({...animal,peso_kg:0}),ValidationError));
test('Animal: rejects negative weight',()=>assert.throws(()=>validateAnimal({...animal,peso_kg:-1}),ValidationError));
test('Animal: rejects future birth date',()=>assert.throws(()=>validateAnimal({...animal,data_nascimento:'2999-01-01'}),ValidationError));
test('Animal: rejects impossible birth date',()=>assert.throws(()=>validateAnimal({...animal,data_nascimento:'2025-02-30'}),ValidationError));
test('Animal: accepts leap-day birth date',()=>assert.equal(validateAnimal({...animal,data_nascimento:'2024-02-29'}).data_nascimento,'2024-02-29'));
test('Animal: rejects array as sex',()=>assert.throws(()=>validateAnimal({...animal,sexo:['macho']}),ValidationError));
test('Search: accent-insensitive normalization',()=>assert.equal(normalize('Pa\u00e7oca'),'pacoca'));
