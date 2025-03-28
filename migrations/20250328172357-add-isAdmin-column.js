"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adiciona o campo `is_admin` na tabela `users`
    await queryInterface.addColumn("users", "is_admin", {
      type: Sequelize.BOOLEAN,
      allowNull: true, // Opcional
      defaultValue: false, // Valor padrão para novos usuários
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove o campo `is_admin` se for necessário reverter
    await queryInterface.removeColumn("users", "is_admin");
  },
};