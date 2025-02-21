const User = require('../models/User');
const secret = require('../config/auth.json');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const createUser = async (req, res) => {
    const { nome, cpf, nome_empresa, cnpj, codi_emp, password,  email} = req.body;
    const newpassword = await bcrypt.hash(password, 10)
    await User.create({
        nome: nome,
        cpf: cpf, 
        nome_empresa: nome_empresa,
        cnpj: cnpj, 
        codi_emp: codi_emp,
        password: newpassword,
        email: email
    }).then(() => {
        res.json("usuário cadastrado com sucesso!");
        console.log('Cadastro de usuário realizado com sucesso!');
    }).catch((erro) => {
        res.json("Deu erro!");
        console.log(`Ops, deu erro: ${erro}`);
    })
}

const searchUsers = async (req, res) => {
    const users = await User.findAll()
       try{
        res.json(users);
       }
       catch(error){
            res.status(404).json("Deu erro")
       }
}


const deleteUser = async(req, res) =>{
    const id = parseInt(req.params.id);
    try {
        await User.destroy({
            where:{
                id:id
            }
    }).then(()=>{
        res.json("Usuário deletado")
    })
} catch(error){
    res.status(404).json("Deu erro!")
}
}

const updateUser = async(req, res) =>{
    const id = parseInt(req.params.id);
    const { name, password, email } = req.body;
    const newpassword = await bcrypt.hash(password, 10)
    try {
        await User.update({
        name: name,
        password: newpassword,
        email:email
    },
    {
        where: {
        id:id
    }
    }).then(()=>{
        res.json("Usuário alterado!")
    })
}
    catch(error){
          res.status(404).json("Deu erro!")
}
}

const authenticatedUser = async (req, res) =>{
    const {email, password} = req.body;
    try {
        const isUserAthenticated = await User.findOne({
            where:{
                email: email,
            }
        })
        const response = await bcrypt.compare(password, isUserAthenticated.password)
        if(response === true){
            const token = jwt.sign({id:email}, secret.secret, {
                expiresIn:86400,
            })
            return res.cookie('token', token, {httpOnly: true}).json({
                name: isUserAthenticated.name,
                email: isUserAthenticated.email,
                token: token
            });
        }
        
    }catch (error){
        return res.json('Usuário nao encontrado');
    }
}


module.exports = { createUser, searchUsers, deleteUser, updateUser, authenticatedUser };