"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remover o índice único do campo 'email'
    await queryInterface.removeIndex("users", "email");
  },

  down: async (queryInterface, Sequelize) => {
    // Restaurar o índice único no campo 'email' em caso de rollback
    await queryInterface.addIndex("users", ["email"], {
      unique: true,
      name: "users_email_unique",
    });
  },
};
