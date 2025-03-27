'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove o valor padrão de is_admin
    await queryInterface.changeColumn('users', 'is_admin', {
      type: Sequelize.BOOLEAN,
      allowNull: false, // Agora obrigatório
    });

    // Garante que o email seja único
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverter as alterações feitas no 'up'
    await queryInterface.changeColumn('users', 'is_admin', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Retorna o valor padrão
    });

    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false, // Remove a restrição de unicidade
    });
  },
};