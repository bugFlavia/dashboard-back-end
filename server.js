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
  1116, 1151, 1152, 1153, 1154, 1201, 1202, 1203, 1204, 1205, 1206, 1207, 1208, 1209, 1408, 1409, 1410, 1411, 1414, 1415, 1451, 1452, 1501, 1503, 1504, 1552, 1553, 1554, 1555, 1556, 1557, 1601, 1602, 1603, 1604, 1605, 1658, 1659, 1660, 1661, 1662, 1663, 1664, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908, 1909, 1910, 1913, 1914, 1916, 1917, 1918, 1919, 1921, 1922, 1923, 1924, 1925, 1926, 1931, 2151, 2152, 2153, 2154, 2201, 2202, 2203, 2204, 2205, 2206, 2207, 2208, 2209, 2408, 2409, 2410, 2411, 2414, 2415, 2501, 2503, 2504, 2551, 2552, 2553, 2554, 2555, 2556, 2557, 2603, 2658, 2659, 2660, 2661, 2662, 2663, 2664, 2901, 2902, 2903, 2904, 2905, 2906, 2907, 2908, 2909, 2910, 2913, 2914, 2915, 2916, 2917, 2918, 2919, 2921, 2922, 2923, 2924, 2925, 2931, 3201, 3202, 3205, 3206, 3207, 3211, 3503, 3553, 5124, 5125, 5151, 5152, 5153, 5155, 5156, 5201, 5202, 5205, 5206, 5207, 5208, 5209, 5210, 5408, 5409, 5410, 5411, 5412, 5413, 5414, 5415, 5451, 5501, 5502, 5503, 5552, 5553, 5554, 5555, 5556, 5557, 5601, 5602, 5603, 5605, 5658, 5659, 5660, 5661, 5662, 5663, 5664, 5665, 5666, 5901, 5902, 5903, 5904, 5905, 5906, 5907, 5909, 5913, 5916, 5917, 5918, 5919, 5921, 5922, 5923, 5924, 5925, 5926, 5929, 5931, 6124, 6125, 6151, 6152, 6153, 6156, 6201, 6202, 6205, 6206, 6207, 6208, 6209, 6210, 6408, 6409, 6410, 6411, 6412, 6413, 6414, 6415, 6501, 6502, 6503, 6551, 6552, 6553, 6554, 6555, 6556, 6557, 6603, 6658, 6659, 6660, 6661, 6662, 6663, 6664, 6665, 6666, 6901, 6902, 6903, 6904, 6905, 6906, 6907, 6909, 6913, 6916, 6917, 6918, 6919, 6921, 6922, 6923, 6924, 6925, 6929, 6931
]);

// Função para filtrar codi_nat e calcular soma excluída
function filtrarResultados(resultados) {
  const excluidos = resultados.filter(row => codiNatExcluidos.has(parseInt(row.codi_nat)));
  const somaExcluida = excluidos.reduce((acc, row) => acc + (row.vcon_ent || row.vcon_sai), 0);
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

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        codi_emp: user.codi_emp, // Envia o array de códigos
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

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

app.post('/user', async (req, res) => {
  try {
    const { nome, nome_empresa, cpf, cnpj, codi_emp, celular, email, senha} = req.body;
    const user = await User.create({ nome, nome_empresa, cpf, cnpj, codi_emp, celular, email, senha});
    res.status(201).json(user);
  } catch (error) {
    console.error("Erro ao criar usuário:", error); // Exibe erro detalhado no console
    res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
  }
});

// Rota somaEntradas
app.post('/somaEntradas', authMiddleware, async (req, res) => {
  try {
    const { meses, ano } = req.body;

    if (!meses || !ano || !Array.isArray(meses)) {
      return res.status(400).json({ error: 'Ano e um array de meses são obrigatórios.' });
    }

    const intervalos = meses
      .map(mes => `DATA_ENTRADA BETWEEN '${ano}-${mes}-01' AND '${ano}-${mes}-${getUltimoDiaMes(ano, mes)}'`)
      .join(' OR ');

    const odbcConnection = await connectToOdbc();

    let totalSemExcluidos = 0;
    let totalComExcluidos = 0;
    const cfopsExcluidosGeral = [];

    // Loop para processar todos os códigos de empresa
    for (const codiEmp of req.user.codi_emp) {
      const query = `
        SELECT vcon_ent, codi_nat
        FROM bethadba.efentradas
        WHERE codi_emp = ? AND (${intervalos})
      `;

      const resultados = await odbcConnection.query(query, [codiEmp]);
      const { filtrados, somaExcluida, excluidos } = filtrarResultados(resultados);

      totalSemExcluidos += filtrados.reduce((acc, row) => acc + (row.vcon_ent || 0), 0);
      totalComExcluidos += somaExcluida;
      cfopsExcluidosGeral.push(...excluidos.map(row => row.codi_nat));
    }

    res.json({
      totalSemExcluidos,
      totalComExcluidos: totalSemExcluidos + totalComExcluidos,
      cfopsExcluidos: cfopsExcluidosGeral
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular a soma de entradas', details: error.message });
  }
});

app.post('/somaSaidas', authMiddleware, async (req, res) => {
  try {
    const { meses, ano } = req.body;

    if (!meses || !ano || !Array.isArray(meses)) {
      return res.status(400).json({ error: 'Ano e um array de meses são obrigatórios.' });
    }

    const intervalos = meses
      .map(mes => `DATA_SAIDA BETWEEN '${ano}-${mes}-01' AND '${ano}-${mes}-${getUltimoDiaMes(ano, mes)}'`)
      .join(' OR ');

    const odbcConnection = await connectToOdbc();

    let totalSemExcluidos = 0;
    let totalComExcluidos = 0;
    const cfopsExcluidosGeral = [];

    // Loop para processar todos os códigos de empresa
    for (const codiEmp of req.user.codi_emp) {
      const query = `
        SELECT vcon_sai, codi_nat
        FROM bethadba.efsaidas
        WHERE codi_emp = ? AND (${intervalos})
      `;

      const resultados = await odbcConnection.query(query, [codiEmp]);
      const { filtrados, somaExcluida, excluidos } = filtrarResultados(resultados);

      totalSemExcluidos += filtrados.reduce((acc, row) => acc + (row.vcon_sai || 0), 0);
      totalComExcluidos += somaExcluida;
      cfopsExcluidosGeral.push(...excluidos.map(row => row.codi_nat));
    }

    res.json({
      totalSemExcluidos,
      totalComExcluidos: totalSemExcluidos + totalComExcluidos,
      cfopsExcluidos: cfopsExcluidosGeral
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular a soma de saídas', details: error.message });
  }
});


app.post('/icms', authMiddleware, async (req, res) => {
  try {
    const { meses, ano } = req.body;

    if (!meses || !ano || !Array.isArray(meses)) {
      return res.status(400).json({ error: 'Ano e um array de meses são obrigatórios' });
    }

    const intervalos = meses
      .map(mes => `data_sim BETWEEN '${ano}-${mes}-01' AND '${ano}-${mes}-${getUltimoDiaMes(ano, mes)}'`)
      .join(' OR ');

    const odbcConnection = await connectToOdbc();

    const resultadosPorEmpresa = {};

    for (const codiEmp of req.user.codi_emp) {
      const query = `SELECT COALESCE(SUM(sdev_sim), 0) AS total FROM bethadba.efsdoimp WHERE codi_emp = ? AND (${intervalos}) AND codi_imp = 1`;

      const [result] = await odbcConnection.query(query, [codiEmp]);

      resultadosPorEmpresa[codiEmp] = result.total; // Salva o total por empresa
    }

    res.json(resultadosPorEmpresa);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular o ICMS', details: error.message });
  }
});


app.post('/pis', authMiddleware, async (req, res) => {
  try {
    const { meses, ano } = req.body;

    if (!meses || !ano || !Array.isArray(meses)) {
      return res.status(400).json({ error: 'Ano e um array de meses são obrigatórios.' });
    }

    const odbcConnection = await connectToOdbc();
    let totalGeral = 0;

    for (const codiEmp of req.user.codi_emp) {
      const intervalos = meses
        .map(mes => `data_sim BETWEEN '${ano}-${mes}-01' AND '${ano}-${mes}-${getUltimoDiaMes(ano, mes)}'`)
        .join(' OR ');

      const query = `
        SELECT COALESCE(SUM(sdev_sim), 0) AS total
        FROM bethadba.efsdoimp
        WHERE codi_emp = ? AND (${intervalos}) AND codi_imp = 17
      `;

      const [result] = await odbcConnection.query(query, [codiEmp]);
      totalGeral += result.total || 0;
    }

    res.json({ total: totalGeral });
  } catch (error) {
    console.error("Erro ao calcular o PIS:", error);
    res.status(500).json({ error: "Erro ao calcular o PIS", details: error.message });
  }
});


app.post('/cofins', authMiddleware, async (req, res) => {
  try {
    const { meses, ano } = req.body;

    if (!meses || !ano || !Array.isArray(meses)) {
      return res.status(400).json({ error: 'Ano e um array de meses são obrigatórios.' });
    }

    const odbcConnection = await connectToOdbc();
    let totalGeral = 0;

    for (const codiEmp of req.user.codi_emp) {
      const intervalos = meses
        .map(mes => `data_sim BETWEEN '${ano}-${mes}-01' AND '${ano}-${mes}-${getUltimoDiaMes(ano, mes)}'`)
        .join(' OR ');

      const query = `
        SELECT COALESCE(SUM(sdev_sim), 0) AS total
        FROM bethadba.efsdoimp
        WHERE codi_emp = ? AND (${intervalos}) AND codi_imp = 19
      `;

      const [result] = await odbcConnection.query(query, [codiEmp]);
      totalGeral += result.total || 0;
    }

    res.json({ total: totalGeral });
  } catch (error) {
    console.error("Erro ao calcular a COFINS:", error);
    res.status(500).json({ error: "Erro ao calcular a COFINS", details: error.message });
  }
});


app.post('/valorFolha', authMiddleware, async (req, res) => {
  try {
    const { meses, ano } = req.body;

    if (!meses || !ano || !Array.isArray(meses)) {
      return res.status(400).json({ error: 'Ano e um array de meses são obrigatórios.' });
    }

    const odbcConnection = await connectToOdbc();

    let totalProventos = 0;
    let totalDescontos = 0;

    for (const codiEmp of req.user.codi_emp) {
      for (const mes of meses) {
        const primeiroDia = `${ano}-${mes.toString().padStart(2, '0')}-01`;
        const ultimoDia = `${ano}-${mes.toString().padStart(2, '0')}-${getUltimoDiaMes(ano, mes)}`;

        const query = `
          SELECT VALOR_CAL, PROV_DESC
          FROM bethadba.fomovtoserv
          WHERE codi_emp = ?
            AND DATA BETWEEN ? AND ?
            AND RATEIO = 0
            AND TIPO_PROCES = 11
            AND I_EVENTOS NOT IN (9176, 9177, 9178)
        `;

        const resultados = await odbcConnection.query(query, [codiEmp, primeiroDia, ultimoDia]);

        resultados.forEach(({ VALOR_CAL, PROV_DESC }) => {
          const valor = parseFloat(VALOR_CAL) || 0;

          if (PROV_DESC === 'P') {
            totalProventos += valor;
          } else if (PROV_DESC === 'D') {
            totalDescontos += valor;
          }
        });
      }
    }

    const totalGeral = totalProventos - totalDescontos;

    res.json({
      totalProventos: parseFloat(totalProventos.toFixed(2)),
      totalDescontos: parseFloat(totalDescontos.toFixed(2)),
      totalGeral: parseFloat(totalGeral.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar múltiplos meses.', detalhes: error.message });
  }
});


app.post('/irrf', authMiddleware, async (req, res) => {
  try {
    const { meses, ano } = req.body;

    if (!meses || !ano || !Array.isArray(meses)) {
      return res.status(400).json({ error: 'Ano e um array de meses são obrigatórios.' });
    }

    const odbcConnection = await connectToOdbc();
    let totalGeral = 0;

    for (const codiEmp of req.user.codi_emp) {
      const intervalos = meses
        .map(mes => {
          const primeiroDia = `${ano}-${mes.toString().padStart(2, '0')}-01`;
          const ultimoDia = `${ano}-${mes.toString().padStart(2, '0')}-${getUltimoDiaMes(ano, mes)}`;
          return `(periodo_inicio >= '${primeiroDia}' AND periodo_fim <= '${ultimoDia}')`;
        })
        .join(' OR ');

      const query = `
        SELECT COALESCE(SUM(valor), 0) AS total
        FROM bethadba.focalcirrf
        WHERE codi_emp = ? AND (${intervalos})
      `;

      const [result] = await odbcConnection.query(query, [codiEmp]);
      totalGeral += result.total || 0;
    }

    res.json({ total: totalGeral });
  } catch (error) {
    console.error("Erro ao calcular o IRRF:", error);
    res.status(500).json({ error: "Erro ao calcular o IRRF", details: error.message });
  }
});


app.post('/inss', authMiddleware, async (req, res) => {
  try {
    const { meses, ano } = req.body;

    if (!meses || !ano || !Array.isArray(meses)) {
      return res.status(400).json({ error: 'Ano e um array de meses são obrigatórios.' });
    }

    const odbcConnection = await connectToOdbc();
    let totalGeral = 0;

    for (const codiEmp of req.user.codi_emp) {
      const intervalos = meses
        .map(mes => {
          const primeiroDia = `${ano}-${mes.toString().padStart(2, '0')}-01`;
          const ultimoDia = `${ano}-${mes.toString().padStart(2, '0')}-${getUltimoDiaMes(ano, mes)}`;
          return `(competencia BETWEEN '${primeiroDia}' AND '${ultimoDia}')`;
        })
        .join(' OR ');

      const query = `
        SELECT COALESCE(SUM(total_guia), 0) AS total
        FROM bethadba.foguiainss
        WHERE codi_emp = ? AND (${intervalos})
      `;

      const [result] = await odbcConnection.query(query, [codiEmp]);
      totalGeral += result.total || 0;
    }

    res.json({ total: totalGeral });
  } catch (error) {
    console.error("Erro ao calcular o INSS:", error);
    res.status(500).json({ error: "Erro ao calcular o INSS", details: error.message });
  }
});


app.post('/fgts', authMiddleware, async (req, res) => {
  try {
    const { meses, ano } = req.body;

    if (!meses || !ano || !Array.isArray(meses)) {
      return res.status(400).json({ error: 'Ano e um array de meses são obrigatórios.' });
    }

    const odbcConnection = await connectToOdbc();
    let totalGeral = 0;

    for (const codiEmp of req.user.codi_emp) {
      const intervalos = meses
        .map(mes => {
          const primeiroDia = `${ano}-${mes.toString().padStart(2, '0')}-01`;
          const ultimoDia = `${ano}-${mes.toString().padStart(2, '0')}-${getUltimoDiaMes(ano, mes)}`;
          return `(data BETWEEN '${primeiroDia}' AND '${ultimoDia}')`;
        })
        .join(' OR ');

      const query = `
        SELECT COALESCE(SUM(valor_cal), 0) AS total
        FROM bethadba.fomovtoserv
        WHERE codi_emp = ? AND (${intervalos}) AND i_eventos = 996 AND tipo_proces = 11 AND rateio = 0
      `;

      const [result] = await odbcConnection.query(query, [codiEmp]);
      totalGeral += result.total || 0;
    }

    res.json({ total: totalGeral });
  } catch (error) {
    console.error("Erro ao calcular o FGTS:", error);
    res.status(500).json({ error: "Erro ao calcular o FGTS", details: error.message });
  }
});


// Inicializando o servidor
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

module.exports = app;
