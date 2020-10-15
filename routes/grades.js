import express from 'express';
import { promises as fs } from 'fs';

const { readFile, writeFile } = fs;

const router = express.Router();

/**
 * 4. Crie um endpoint para consultar uma grade em específico. Este endpoint deverá receber como parâmetro o id da grade e retornar suas informações.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const grade = data.grades.find(
      (grade) => grade.id === parseInt(req.params.id)
    );
    res.send(grade);
    global.logger.info('GET /grade/:id');
  } catch (err) {
    next(err);
  }
});

/**
 * 3. Crie um endpoint para excluir uma grade. Este endpoint deverá receber como parâmetro o id da grade e realizar sua exclusão do arquivo grades.json.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    data.grades = data.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id)
    );
    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    res.end();
    logger.info(`DELETE /grade/:id - ${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

/**
 * 1. Crie um endpoint para criar uma grade.
 * Este endpoint deverá receber como parâmetros os campos
 * student, subject, type e value conforme descritos acima.
 * Esta grade deverá ser salva no arquivo json grades.json, e deverá ter um id único associado.
 * No campo timestamp deverá ser salvo a data e hora do momento da inserção.
 * O endpoint deverá retornar o objeto da grade que foi criada.
 * A API deverá garantir o incremento automático deste identificador, de forma que ele não se repita entre os registros.
 * Dentro do arquivo grades.json que foi fornecido para utilização no desafio o campo nextId já está com um valor definido.
 * Após a inserção é preciso que esse nextId seja incrementado e salvo no próprio arquivo, de forma que na próxima inserção ele possa ser utilizado.
 */

router.post('/', async (req, res, next) => {
  try {
    let grade = req.body;
    console.log(grade);

    validadeGrade(grade);

    const data = JSON.parse(await readFile(global.fileName));

    grade = {
      id: data.nextId++,
      student: grade.student,
      subject: grade.balance,
      type: grade.type,
      value: grade.value,
      timestamp: new Date(),
    };
    data.grades.push(grade);

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(grade);

    logger.info(`POST /grade - ${JSON.stringify(grade)}`);
  } catch (err) {
    next(err);
  }
});

/**
 * 2. Crie um endpoint para atualizar uma grade.
 * Este endpoint deverá receber como parâmetros o id da grade a ser alterada e os campos student, subject, type e value.
 * O endpoint deverá validar se a grade informada existe, caso não exista deverá retornar um erro.
 * Caso exista, o endpoint deverá atualizar as informações recebidas por parâmetros no registro, e realizar sua atualização com os novos dados alterados no arquivo grades.json.
 */

router.put('/', async (req, res, next) => {
  try {
    const grade = req.body;

    if (!grade.id) {
      throw new Error('Id é obrigatórios.');
    }

    validadeGrade(grade);

    const data = JSON.parse(await readFile(global.fileName));
    const index = data.grades.findIndex((g) => g.id === grade.id);

    if (index === -1) {
      throw new Error('Registro não encontrado.');
    }

    data.grades[index].student = grade.student;
    data.grades[index].subject = grade.subject;
    data.grades[index].type = grade.type;
    data.grades[index].value = grade.value;

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(grade);

    logger.info(`PUT /grade - ${JSON.stringify(grade)}`);
  } catch (err) {
    next(err);
  }
});

/**
 * 5 - Crie um endpoint para consultar a nota total de um aluno em uma disciplina.
 * O endpoint deverá receber como parâmetro o student e o subject, e realizar a soma de todas os as notas de atividades correspondentes a aquele subject para aquele student.
 * O endpoint deverá retornar a soma da propriedade value dos registros encontrados.
 */

router.get('/totalGrade/:student/:subject', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const gradeArray = data.grades.filter(
      (grade) =>
        grade.student === req.params.student &&
        grade.subject === req.params.subject
    );

    if (gradeArray.length === 0) {
      throw new Error('Aluno com disciplina não encontrado.');
    }

    const totalGrade = gradeArray.reduce((acumulator, current) => {
      return acumulator + current.value;
    }, 0);

    console.log(gradeArray);

    res.send(
      `A soma da propriedade value para o student ${req.params.student} e subject ${req.params.subject} é: ${totalGrade}`
    );
    global.logger.info('GET totalGrade/:student/:subject');
  } catch (err) {
    next(err);
  }
});

/**
 * 6. Crie um endpoint para consultar a média das grades de determinado subject e type.
 * O endpoint deverá receber como parâmetro um subject e um type, e retornar a média.
 * A média é calculada somando o registro value de todos os registros que possuem o subject e type informados, e dividindo pelo total de registros que possuem este mesmo subject e type.
 */

router.get('/averageGrade/:subject/:type', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const gradeArray = await data.grades.filter(
      (grade) =>
        grade.subject === req.params.subject && grade.type === req.params.type
    );

    if (gradeArray.length === 0) {
      throw new Error('Nenhum subject com esse type foi encontrado.');
    }

    const totalGrade = gradeArray.reduce((acumulator, current) => {
      return acumulator + current.value;
    }, 0);

    const averageGrade = parseFloat(totalGrade / gradeArray.length).toFixed(2);

    res.send(
      `A media das grades para o subject ${req.params.subject} e type ${req.params.type} é: ${averageGrade}`
    );
    global.logger.info('GET averageGrade/:subject/:type');
  } catch (err) {
    next(err);
  }
});

/**
 * 7. Crie um endpoint para retornar as três melhores grades de acordo com determinado subject e type.
 * O endpoint deve receber como parâmetro um subject e um type retornar um array com os três registros de maior value daquele subject e type.
 * A ordem deve ser do maior para o menor.
 */

router.get('/bestGrades/:subject/:type', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const gradeArray = await data.grades.filter(
      (grade) =>
        grade.subject === req.params.subject && grade.type === req.params.type
    );

    if (gradeArray.length === 0) {
      throw new Error('Nenhum subject com esse type foi encontrado.');
    }

    const gradeArraySorted = gradeArray
      .sort(function (a, b) {
        return a.value - b.value;
      })
      .reverse()
      .slice(0, 3);

    console.log(gradeArraySorted);

    res.send(gradeArraySorted);

    global.logger.info('GET averageGrade/:subject/:type');
  } catch (err) {
    next(err);
  }
});

function validadeGrade(grade) {
  if (!grade.student || !grade.subject || !grade.type || grade.value == null) {
    throw new Error(
      'Os campos student, subject, type e value são obrigatórios.'
    );
  }
  return true;
}

router.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
  res.status(400).send({ error: err.message });
});

export default router;
