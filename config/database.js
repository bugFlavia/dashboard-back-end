require('dotenv').config();
const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: false
  }
);

sequelize.authenticate()
  .then(() => console.log('🔥 Conectado ao MySQL!'))
  .catch(err => console.error('❌ Erro ao conectar no MySQL:', err));

module.exports = sequelize;
