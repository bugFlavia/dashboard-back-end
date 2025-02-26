const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Banco de dados simulado (em memória)
let items = [];
let idCounter = 1;

// Rotas CRUD
app.get('/items', (req, res) => {
  res.json(items);
});

app.post('/items', (req, res) => {
  const newItem = { id: idCounter++, ...req.body };
  items.push(newItem);
  res.status(201).json(newItem);
});

app.get('/items/:id', (req, res) => {
  const item = items.find(i => i.id == req.params.id);
  item ? res.json(item) : res.status(404).json({ error: 'Item não encontrado' });
});

app.put('/items/:id', (req, res) => {
  const index = items.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    items[index] = { id: items[index].id, ...req.body };
    res.json(items[index]);
  } else {
    res.status(404).json({ error: 'Item não encontrado' });
  }
});

app.delete('/items/:id', (req, res) => {
  items = items.filter(i => i.id != req.params.id);
  res.json({ message: 'Item removido com sucesso' });
});

// Inicializando o servidor apenas se rodar localmente
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

// Exportando para a Vercel
module.exports = app;
