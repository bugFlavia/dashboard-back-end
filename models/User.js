const connection = require('../config/connection');

const User = connection.sequelize.define('users', {
    id: { type: connection.Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: connection.Sequelize.STRING },
    cpf: { type: connection.Sequelize.STRING },
    nome_empresa: { type: connection.Sequelize.STRING },
    cnpj: { type: connection.Sequelize.STRING },
    codi_emp: { type: connection.Sequelize.STRING },
    password: { type: connection.Sequelize.STRING },
    email: { type: connection.Sequelize.STRING, unique: true }
});

User.sync();
module.exports = User;
