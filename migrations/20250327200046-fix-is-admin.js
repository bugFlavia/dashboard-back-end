'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'is_admin', {
      type: Sequelize.BOOLEAN,
      allowNull: false, // Campo obrigatório
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'is_admin', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Reverte para valor padrão, se necessário
    });
  },
};