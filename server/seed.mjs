import { openDatabase, transaction } from './database.mjs';
import { Repository } from './repository.mjs';
import { validateTutor, validateAnimal } from '../public/js/validation.mjs';
const db = openDatabase();
const repo = new Repository(db);
try {
  if (repo.stats().tutores || repo.stats().animais) {
    console.log('O banco ja possui registros. Nenhum dado foi alterado.');
  } else {
    const tutors = [
      ['Marina Exemplo','85900000101','marina@example.com','Aldeota'],
      ['Rafael Modelo','85900000102','rafael@example.com','Benfica'],
      ['Clara Demonstracao','85900000103','clara@example.com','Coc\u00f3'],
      ['Pedro Teste','8530000104','pedro@example.com','Parquel\u00e2ndia']
    ];
    const ids = transaction(db, () => tutors.map(([nome,telefone,email,bairro]) => repo.createTutor(validateTutor({nome,telefone,email,bairro,observacoes:'Registro fict\u00edcio para demonstra\u00e7\u00e3o.'})).id));
    for (const [nome,especie,raca,sexo,index,peso_kg] of [
      ['Bento','cao','Golden retriever','macho',0,28.5],['Luna','gato','Sem ra\u00e7a definida','femea',0,4.2],
      ['Pa\u00e7oca','cao','Sem ra\u00e7a definida','macho',1,12.3],['Mel','cao','Poodle','femea',2,6.1],
      ['Nina','gato','Siam\u00eas','femea',2,3.7],['Pipoca','coelho','Mini lop','femea',3,1.8]
    ]) repo.createAnimal(validateAnimal({nome,especie,raca,sexo,tutor_id:ids[index],peso_kg,observacoes:'Animal fict\u00edcio.'}));
    console.log('Demonstracao criada: 4 tutores e 6 animais ficticios.');
  }
} finally { db.close(); }
