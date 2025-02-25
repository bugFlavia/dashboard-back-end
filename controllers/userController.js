const User = require('../models/User');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const secret = require('../config/auth.json');

const createUser = async (req, res) => {
    try {
        const { nome, cpf, nome_empresa, cnpj, codi_emp, celular, password, email } = req.body;
        const newpassword = await bcrypt.hash(password, 10);
        await User.create({ nome, cpf, nome_empresa, cnpj, codi_emp, celular, password: newpassword, email });
        res.json("Usuário cadastrado com sucesso!");
    } catch (erro) {
        res.status(500).json({ error: "Erro ao cadastrar usuário" });
    }
};

const searchUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar usuários" });
    }
};

const deleteUser = async (req, res) => {
    try {
        await User.destroy({ where: { id: req.params.id } });
        res.json("Usuário deletado");
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar usuário" });
    }
};

const updateUser = async (req, res) => {
    try {
        const { nome, cpf, nome_empresa, cnpj, codi_emp, celular, password, email } = req.body;
        const newpassword = await bcrypt.hash(password, 10);
        await User.update({ nome, cpf, nome_empresa, cnpj, codi_emp, celular, password: newpassword, email }, { where: { id: req.params.id } });
        res.json("Usuário alterado!");
    } catch (error) {
        res.status(500).json({ error: "Erro ao alterar usuário" });
    }
};

const authenticatedUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Senha incorreta.' });

        const token = jwt.sign({ id: email }, secret.secret, { expiresIn: 86400 });
        res.cookie('token', token, { httpOnly: true }).json({ message: "Login realizado com sucesso!", token });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao autenticar usuário' });
    }
};

module.exports = { createUser, searchUsers, deleteUser, updateUser, authenticatedUser };
