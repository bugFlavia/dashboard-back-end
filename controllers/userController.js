const User = require('../models/User');
const secret = require('../config/auth.json');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const createUser = async (req, res) => {
    const { nome, cpf, nome_empresa, cnpj, codi_emp, celular, password, email } = req.body;
    const newpassword = await bcrypt.hash(password, 10);
    await User.create({
        nome,
        cpf,
        nome_empresa,
        cnpj,
        codi_emp,
        celular,
        password: newpassword,
        email
    }).then(() => {
        res.json("Usuário cadastrado com sucesso!");
        console.log('Cadastro de usuário realizado com sucesso!');
    }).catch((erro) => {
        res.json("Deu erro!");
        console.log(`Ops, deu erro: ${erro}`);
    });
};

const searchUsers = async (req, res) => {
    const users = await User.findAll();
    try {
        res.json(users);
    } catch (error) {
        res.status(404).json("Deu erro");
    }
};

const deleteUser = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await User.destroy({
            where: {
                id: id
            }
        }).then(() => {
            res.json("Usuário deletado");
        });
    } catch (error) {
        res.status(404).json("Deu erro!");
    }
};

const updateUser = async (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, cpf, nome_empresa, cnpj, codi_emp, celular, password, email } = req.body;
    const newpassword = await bcrypt.hash(password, 10);
    try {
        await User.update({
            nome,
            cpf,
            nome_empresa,
            cnpj,
            codi_emp,
            celular,
            password: newpassword,
            email
        }, {
            where: {
                id: id
            }
        }).then(() => {
            res.json("Usuário alterado!");
        });
    } catch (error) {
        res.status(404).json("Deu erro!");
    }
};

const authenticatedUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const isUserAthenticated = await User.findOne({
            where: {
                email: email,
            }
        });
        const response = await bcrypt.compare(password, isUserAthenticated.password);
        if (response === true) {
            const token = jwt.sign({ id: email }, secret.secret, {
                expiresIn: 86400,
            });
            console.log('Token gerado:', token); // Exibe o token gerado no console
            return res.cookie('token', token, { httpOnly: true }).json({
                message: "Login realizado com sucesso!",
                token: token
            });
        } else {
            return res.status(401).json('Senha incorreta.');
        }
    } catch (error) {
        return res.status(404).json('Usuário não encontrado');
    }
};

module.exports = { createUser, searchUsers, deleteUser, updateUser, authenticatedUser };
