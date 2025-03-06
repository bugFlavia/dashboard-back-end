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
const codiNatExcluidos = [
  '1.116', '1.151', '1.152', '1.153', '1.154', '1.201', '1.202', '1.203', '1.204', '1.205', '1.206', '1.207', '1.208', '1.209', '1.408', '1.409', '1.410', '1.411', '1.414', '1.415', '1.451', '1.452', '1.501', '1.503', '1.504', '1.552', '1.553', '1.554', '1.555', '1.556', '1.557', '1.601', '1.602', '1.603', '1.604', '1.605', '1.658', '1.659', '1.660', '1.661', '1.662', '1.663', '1.664', '1.901', '1.902', '1.903', '1.904', '1.905', '1.906', '1.907', '1.908', '1.909', '1.913', '1.914', '1.915', '1.916', '1.917', '1.918', '1.919', '1.921', '1.922', '1.923', '1.924', '1.925', '1.926', '1.931',
  '2.116', '2.151', '2.152', '2.153', '2.154', '2.201', '2.202', '2.203', '2.204', '2.205', '2.206', '2.207', '2.208', '2.209', '2.408', '2.409', '2.410', '2.411', '2.414', '2.415', '2.551', '2.552', '2.501', '2.503', '2.504', '2.552', '2.553', '2.554', '2.555', '2.556', '2.557', '2.603', '2.658', '2.659', '2.660', '2.661', '2.662', '2.663', '2.664', '2.901', '2.902', '2.903', '2.904', '2.905', '2.906', '2.907', '2.908', '2.909', '2.913', '2.914', '2.915', '2.916', '2.917', '2.918', '2.919', '2.921', '2.922', '2.923', '2.924', '2.925', '2.931'
]; // Lista completa mantida

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

// Rota somaEntradas
app.post('/somaEntradas', authMiddleware, async (req, res) => {
  try {
    const { meses, ano } = req.body;
    if (!meses || !ano || !Array.isArray(meses)) {
      return res.status(400).json({ error: 'Ano e um array de meses são obrigatórios' });
    }
    const intervalos = meses.map(mes => `DATA_ENTRADA BETWEEN '${ano}-${mes}-01' AND '${ano}-${mes}-${getUltimoDiaMes(ano, mes)}'`).join(' OR ');
    const codiNatFiltro = codiNatExcluidos.map(nat => `'${nat}'`).join(',');
    const query = `SELECT SUM(vprod_ent) AS total FROM bethadba.efentradas WHERE codi_emp = ? AND (${intervalos}) AND codi_nat NOT IN (${codiNatFiltro})`;
    const odbcConnection = await connectToOdbc();
    const result = await odbcConnection.query(query, [req.user.codi_emp]);
    res.json({ total: result[0]?.total || 0 });
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
    const codiNatFiltro = codiNatExcluidos.map(nat => `'${nat}'`).join(',');
    const query = `SELECT SUM(vprod_sai) AS total FROM bethadba.efsaidas WHERE codi_emp = ? AND (${intervalos}) AND codi_nat NOT IN (${codiNatFiltro})`;
    const odbcConnection = await connectToOdbc();
    const result = await odbcConnection.query(query, [req.user.codi_emp]);
    res.json({ total: result[0]?.total || 0 });
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
