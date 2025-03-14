"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remover o índice único do campo 'cpf'
    await queryInterface.removeIndex("users", "cpf");
  },

  down: async (queryInterface, Sequelize) => {
    // Restaurar o índice único no campo 'cpf' em caso de rollback
    await queryInterface.addIndex("users", ["cpf"], {
      unique: true,
      name: "users_cpf_unique",
    });
  },
};
