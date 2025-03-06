// Importando dependências
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('./models/user');
const connectToOdbc = require('./config/odbcConnection');

const app = express();
const port = process.env.PORT || 3003;
const SECRET_KEY = process.env.SECRET_KEY || 'secreto';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

// Middleware de autenticação
function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Faça login.' });
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido.' });
  }
}

// Função para calcular o último dia do mês
function getUltimoDiaMes(ano, mes) {
  return new Date(ano, mes, 0).getDate();
}

// Rota de login
app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ where: { email, senha } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, codi_emp: user.codi_emp }, SECRET_KEY, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({ message: 'Login bem-sucedido' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login', details: error.message });
  }
});

// Rotas protegidas
app.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuários', details: error.message });
  }
});

app.post('/somaEntradas', authMiddleware, async (req, res) => {
  try {
    const { mes, ano, dia } = req.body;
    if (!mes || !ano) {
      return res.status(400).json({ error: 'Mês e ano são obrigatórios' });
    }
    const diaInicio = dia ? dia : '01';
    const diaFim = dia ? dia : getUltimoDiaMes(ano, mes);
    const dataInicio = `${ano}-${mes}-${diaInicio}`;
    const dataFim = `${ano}-${mes}-${diaFim}`;

    const odbcConnection = await connectToOdbc();
    const query = `SELECT SUM(vprod_ent) AS total FROM bethadba.efentradas WHERE codi_emp = ? AND DATA_ENTRADA BETWEEN ? AND ?`;
    const result = await odbcConnection.query(query, [req.user.codi_emp, dataInicio, dataFim]);
    res.json({ total: result[0].total });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular a soma', details: error.message });
  }
});

app.post('/somaSaidas', authMiddleware, async (req, res) => {
  try {
    const { mes, ano, dia } = req.body;
    if (!mes || !ano) {
      return res.status(400).json({ error: 'Mês e ano são obrigatórios' });
    }
    const diaInicio = dia ? dia : '01';
    const diaFim = dia ? dia : getUltimoDiaMes(ano, mes);
    const dataInicio = `${ano}-${mes}-${diaInicio}`;
    const dataFim = `${ano}-${mes}-${diaFim}`;

    const odbcConnection = await connectToOdbc();
    const query = `SELECT SUM(vprod_sai) AS total FROM bethadba.efsaidas WHERE codi_emp = ? AND DATA_SAIDA BETWEEN ? AND ?`;
    const result = await odbcConnection.query(query, [req.user.codi_emp, dataInicio, dataFim]);
    res.json({ total: result[0].total });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular a soma', details: error.message });
  }
});

// Inicializando o servidor
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

module.exports = app;