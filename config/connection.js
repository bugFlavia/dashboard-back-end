const { Sequelize } = require('sequelize');
const config = require('../config/config.json')[process.env.NODE_ENV || 'development'];
require('dotenv').config();

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: 'mysql',
  port: config.port,
});

try {
  sequelize.authenticate();
  console.log('Usuário autenticado com sucesso');
} catch (error) {
  console.error('Erro de autenticação', error);
}

module.exports = { Sequelize, sequelize };
