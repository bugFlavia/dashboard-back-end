"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {

    // Alterar o tipo da coluna codi_emp para JSON
    await queryInterface.changeColumn("users", "codi_emp", {
      type: Sequelize.JSON, // Para armazenar arrays
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverter a alteração do tipo de dado de codi_emp
    await queryInterface.changeColumn("users", "codi_emp", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
