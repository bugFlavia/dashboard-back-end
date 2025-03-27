module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "is_admin", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Todos os usuários começam como não administradores
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "is_admin");
  },
};