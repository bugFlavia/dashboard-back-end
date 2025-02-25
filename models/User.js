const connection = require('../config/connection');

const User = connection.sequelize.define('users',{
    id: {
        type: connection.Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    nome: {
        type: connection.Sequelize.STRING,
        allowNull: true
    },
    cpf: {
        type: connection.Sequelize.STRING,
        allowNull: true
    },
    nome_empresa: {
        type: connection.Sequelize.STRING,
        allowNull: true
    },
    cnpj: {
        type: connection.Sequelize.STRING,
        allowNull: true
    },
    codi_emp: {
        type: connection.Sequelize.STRING,
        allowNull: true
    },
    password:{
        type: connection.Sequelize.STRING,
        allowNull:true
    },
    email:{
        type: connection.Sequelize.STRING,
        allowNull:true,
        unique:true
    }
})
User.sync();
module.exports = User;
