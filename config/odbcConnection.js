require('dotenv').config();
const odbc = require('odbc');

const connectionString = `DRIVER=${process.env.ODBC_DRIVER};SERVER=${process.env.ODBC_SERVER};PORT=${process.env.ODBC_PORT};DATABASE=${process.env.ODBC_DATABASE};UID=${process.env.ODBC_USER};PWD=${process.env.ODBC_PASS}`;

async function connectToOdbc() {
  try {
    const connection = await odbc.connect(connectionString);
    console.log('🔥 Conectado ao banco de dados ODBC!');
    return connection;
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados ODBC:', error);
    throw error;
  }
}

module.exports = connectToOdbc;
