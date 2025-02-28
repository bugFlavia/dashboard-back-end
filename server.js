// Importando dependências
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Sequelize } = require('sequelize');
const User = require('./models/user'); // Modelo do Usuário

// Inicializando o servidor
const app = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conectando ao banco de dados
const sequelize = new Sequelize(process.env.JAWSDB_URL, {
  dialect: 'mysql',
  logging: false
});

// Testar conexão com o banco
sequelize.authenticate()
  .then(() => console.log('Conectado ao banco de dados!'))
  .catch(err => console.error('Erro ao conectar ao banco:', err));

// Rotas CRUD
// Listar todos os usuários
app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error); // Exibe erro detalhado no console
    res.status(500).json({ error: 'Erro ao listar usuários', details: error.message });
  }
});

app.post('/user', async (req, res) => {
  try {
    const { nome, nome_empresa, cpf, cnpj, codi_emp, celular, email, senha } = req.body;
    const user = await User.create({ nome, nome_empresa, cpf, cnpj, codi_emp, celular, email, senha });
    res.status(201).json(user);
  } catch (error) {
    console.error("Erro ao criar usuário:", error); // Exibe erro detalhado no console
    res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
  }
});

// Inicializando o servidor
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

// Exportando para a Vercel
module.exports = app;
