const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nome_empresa: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cnpj: {
    type: DataTypes.STRING,
    allowNull: true, // Permite null para administradores
    unique: true, // Garante unicidade quando definido
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false, // Torna obrigatório no modelo
  },
  codi_emp: {
    type: DataTypes.JSON,
    allowNull: false
  },
  celular: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Garante unicidade do campo email
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;