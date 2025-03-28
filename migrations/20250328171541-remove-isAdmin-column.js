"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove o campo `is_admin` da tabela `users`
    await queryInterface.removeColumn("users", "is_admin");
  },

  down: async (queryInterface, Sequelize) => {
    // Recria o campo `is_admin` se for necessário reverter
    await queryInterface.addColumn("users", "is_admin", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
  },
};