const { Sequelize } = require('sequelize');
const config = require('./config')[process.env.NODE_ENV || 'development'];
require('dotenv').config();

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  port: config.port,
  logging: false
});

sequelize.authenticate()
  .then(() => console.log('Conectado ao banco de dados!'))
  .catch(err => console.error('Erro ao conectar ao banco:', err));

module.exports = { Sequelize, sequelize };
