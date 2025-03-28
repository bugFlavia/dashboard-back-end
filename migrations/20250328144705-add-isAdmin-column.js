"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "is_admin", {
      type: Sequelize.BOOLEAN,
      allowNull: true, // Define que o campo não é obrigatório
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "is_admin");
  },
};