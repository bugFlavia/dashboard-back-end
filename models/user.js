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
  },
  is_admin: {
    type: DataTypes.INTEGER,
    allowNull: true, // Permitir valores nulos
    defaultValue: 0, // Valor padrão como null para usuários padrão
  },
}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;