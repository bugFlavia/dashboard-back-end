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
    const { meses, ano } = req.body;
    if (!meses || !ano || !Array.isArray(meses)) {
      return res.status(400).json({ error: 'Ano e um array de meses são obrigatórios' });
    }

    const intervalos = meses.map(mes => {
      const diaInicio = '01';
      const diaFim = getUltimoDiaMes(ano, mes);
      return `DATA_ENTRADA BETWEEN '${ano}-${mes}-${diaInicio}' AND '${ano}-${mes}-${diaFim}'`;
    }).join(' OR ');

    const odbcConnection = await connectToOdbc();
    const query = `SELECT SUM(vprod_ent) AS total FROM bethadba.efentradas WHERE codi_emp = ? AND (${intervalos})`;
    const result = await odbcConnection.query(query, [req.user.codi_emp]);
    res.json({ total: result[0].total });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular a soma', details: error.message });
  }
});

app.post('/somaSaidas', authMiddleware, async (req, res) => {
  try {
    const { meses, ano } = req.body;
    if (!meses || !ano || !Array.isArray(meses)) {
      return res.status(400).json({ error: 'Ano e um array de meses são obrigatórios' });
    }

    const intervalos = meses.map(mes => {
      const diaInicio = '01';
      const diaFim = getUltimoDiaMes(ano, mes);
      return `DATA_SAIDA BETWEEN '${ano}-${mes}-${diaInicio}' AND '${ano}-${mes}-${diaFim}'`;
    }).join(' OR ');

    const odbcConnection = await connectToOdbc();
    const query = `SELECT SUM(vprod_sai) AS total FROM bethadba.efsaidas WHERE codi_emp = ? AND (${intervalos})`;
    const result = await odbcConnection.query(query, [req.user.codi_emp]);
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