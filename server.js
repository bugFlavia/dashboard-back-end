// Importando dependências
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const User = require('./models/user'); // Certifique-se de usar letras minúsculas
const connectToOdbc = require('./config/odbcConnection'); // Conexão ODBC

// Inicializando o servidor
const app = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conectando ao banco de dados
const sequelize = require('./config/database');

// Sincronizar os modelos com o banco de dados
sequelize.sync()
  .then(() => console.log('Modelos sincronizados com o banco de dados'))
  .catch(err => console.error('Erro ao sincronizar modelos:', err));

// Rotas CRUD

// Rota para cadastrar um novo usuário
app.post('/user', async (req, res) => {
  try {
    const { nome, nome_empresa, cpf, cnpj, codi_emp, celular, email, senha } = req.body;
    const user = await User.create({ nome, nome_empresa, cpf, cnpj, codi_emp, celular, email, senha });
    res.status(201).json(user);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
  }
});

// Rota para listar todos os usuários
app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ error: 'Erro ao listar usuários', details: error.message });
  }
});

// Login do usuário e consulta ao banco de dados ODBC
app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ where: { email, senha } });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const odbcConnection = await connectToOdbc();
    const companyCode = user.codi_emp;
    const query = `SELECT cgce_emp FROM bethadba.geempre WHERE codi_emp = ?`;
    const result = await odbcConnection.query(query, [companyCode]);

    res.json({ user, companyData: result });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ error: 'Erro ao fazer login', details: error.message });
  }
});

// Rota para somar todos os valores da coluna `vlor_lan` para a empresa logada
app.get('/somaEntradas', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ where: { email, senha } });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const odbcConnection = await connectToOdbc();
    const companyCode = user.codi_emp;
    const query = `SELECT SUM(vprod_ent) AS total FROM bethadba.efentradas WHERE codi_emp = ?`;
    const result = await odbcConnection.query(query, [companyCode]);

    res.json({ total: result[0].total });
  } catch (error) {
    console.error("Erro ao calcular a soma dos valores:", error);
    res.status(500).json({ error: 'Erro ao calcular a soma dos valores', details: error.message });
  }
});

// Rota para somar todos os valores da coluna `vprod_sai` para a empresa logada após 2025-01-01
app.get('/somaSaidas', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ where: { email, senha } });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const odbcConnection = await connectToOdbc();
    const companyCode = user.codi_emp;
    const query = `SELECT SUM(vprod_sai) AS total FROM bethadba.efsaidas WHERE codi_emp = ? AND DATA_SAIDA > '2025-01-01'`;
    const result = await odbcConnection.query(query, [companyCode]);

    res.json({ total: result[0].total });
  } catch (error) {
    console.error("Erro ao calcular a soma das vendas:", error);
    res.status(500).json({ error: 'Erro ao calcular a soma das vendas', details: error.message });
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
