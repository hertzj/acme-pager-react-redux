const path = require('path');
const express = require('express');
const app = express();
// Do not touch this file
const { Employee } = require('./db/index.js');

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(path.join(__dirname, '..', 'dist')));

app.use(express.json()) // added

app.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const paginate = (pageNum, pageSize) => {
  return { limit: pageSize, offset: pageNum * pageSize };
};

app.get('/api/employees/:page?', (req, res, next) => {
  const resultsPerPage = 50;
  // pageNum is zero indexed
  let pageNum = req.params.page;
  if (pageNum === undefined) {
    pageNum = 0;
  } else if (isNaN(pageNum)) {
    return res.status(400).send({ error: 'Invalid page number' });
  }

  const { limit, offset } = paginate(pageNum, resultsPerPage);
  Employee.findAndCountAll({
    limit,
    offset,
    order: [
      ['firstName', 'asc'],
      ['lastName', 'asc'],
    ],
  }).then(results => {
    res.status(200).send(results);
  });
});

// added the below

app.post('/api/employees', (req, res, next) => {
  Employee.create(req.body)
    .then(employee => {
      res.statusCode = 200;
      res.sendStatus = employee
    })
    .catch(e => {
      res.statusCode = 400;
      next(e)
    })
})

app.delete('/api/employees/rows/:id', (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  Employee.destroy({
    where: {
      id,
    }
  })
    .then(employees => {
      res.statusCode = 200;
      res.sendStatus = employees;
    })
    .catch(e => {
      res.statusCode = 400;
      next(e);
    })
})

module.exports = { app };
