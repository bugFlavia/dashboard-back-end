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

// Lista de codi_nat que devem ser excluídos da soma
const codiNatExcluidos = new Set([
  1116, 1151, 1152, 1153, 1154, 1201, 1202, 1203, 1204, 1205, 1206, 1207, 1208, 1209,
  1408, 1409, 1410, 1411, 1414, 1415, 1451, 1452, 1501, 1503, 1504, 1552, 1553, 1554,
  1555, 1556, 1557, 1601, 1602, 1603, 1604, 1605, 1658, 1659, 1660, 1661, 1662, 1663,
  1664, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908, 1909, 1913, 1914, 1915, 1916,
  1917, 1918, 1919, 1921, 1922, 1923, 1924, 1925, 1926, 1931
]);

// Função para filtrar codi_nat e calcular soma excluída
function filtrarResultados(resultados) {
  const excluidos = resultados.filter(row => codiNatExcluidos.has(parseInt(row.codi_nat)));
  const somaExcluida = excluidos.reduce((acc, row) => acc + (row.vprod_ent || row.vprod_sai), 0);
  return { filtrados: resultados.filter(row => !codiNatExcluidos.has(parseInt(row.codi_nat))), somaExcluida, excluidos };
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

// Rota para listar todos os usuários
app.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuários', details: error.message });
  }
});

// Rota somaEntradas
app.post('/somaEntradas', authMiddleware, async (req, res) => {
  try {
    const { meses, ano } = req.body;
    if (!meses || !ano || !Array.isArray(meses)) {
      return res.status(400).json({ error: 'Ano e um array de meses são obrigatórios' });
    }
    const intervalos = meses.map(mes => `DATA_ENTRADA BETWEEN '${ano}-${mes}-01' AND '${ano}-${mes}-${getUltimoDiaMes(ano, mes)}'`).join(' OR ');
    const query = `SELECT vprod_ent, codi_nat FROM bethadba.efentradas WHERE codi_emp = ? AND (${intervalos})`;
    const odbcConnection = await connectToOdbc();
    const result = await odbcConnection.query(query, [req.user.codi_emp]);
    const { filtrados, somaExcluida, excluidos } = filtrarResultados(result);
    const total = filtrados.reduce((acc, row) => acc + row.vprod_ent, 0);
    res.json({ total, somaExcluida, cfopsExcluidos: excluidos.map(row => row.codi_nat) });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular a soma', details: error.message });
  }
});

// Rota somaSaidas
app.post('/somaSaidas', authMiddleware, async (req, res) => {
  try {
    const { meses, ano } = req.body;
    if (!meses || !ano || !Array.isArray(meses)) {
      return res.status(400).json({ error: 'Ano e um array de meses são obrigatórios' });
    }
    const intervalos = meses.map(mes => `DATA_SAIDA BETWEEN '${ano}-${mes}-01' AND '${ano}-${mes}-${getUltimoDiaMes(ano, mes)}'`).join(' OR ');
    const query = `SELECT vprod_sai, codi_nat FROM bethadba.efsaidas WHERE codi_emp = ? AND (${intervalos})`;
    const odbcConnection = await connectToOdbc();
    const result = await odbcConnection.query(query, [req.user.codi_emp]);
    const { filtrados, somaExcluida, excluidos } = filtrarResultados(result);
    const total = filtrados.reduce((acc, row) => acc + row.vprod_sai, 0);
    res.json({ total, somaExcluida, cfopsExcluidos: excluidos.map(row => row.codi_nat) });
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
