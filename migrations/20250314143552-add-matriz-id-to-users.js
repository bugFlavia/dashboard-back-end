"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'matriz_id', {
      type: Sequelize.INTEGER,
      allowNull: true,  // Pode ser null para matrizes
      references: {
        model: 'users',  // A tabela é 'users', pois estamos referenciando a própria tabela
        key: 'id',
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'matriz_id');
  },
};
