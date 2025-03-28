"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adiciona o campo is_admin à tabela users
    await queryInterface.addColumn("users", "is_admin", {
      type: Sequelize.BOOLEAN,
      allowNull: true, // Permitir valores nulos
      defaultValue: null, // Definir null como valor padrão
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove o campo is_admin se necessário
    await queryInterface.removeColumn("users", "is_admin");
  },
};