require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const { expressjwt: expressJWT } = require("express-jwt");
const routes = require('./routers/routes');
require('./config/connection');

const app = express();
const port = process.env.PORT || 3003;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(
    expressJWT({
        secret: process.env.SECRET,
        algorithms: ["HS256"],
        getToken: req => req.cookies.token
    }).unless({
        path: ["/user/authenticated", "/user"]
    })
);

app.use('/', routes);

// Middleware para tratar erros de servidor e retornar JSON
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo deu errado!' });
});

app.listen(port, () => { console.log(`Servidor rodando na porta ${port}`); });

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'views', 'index.html');
    res.sendFile(filePath);
});
