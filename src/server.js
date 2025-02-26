const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const routes = require('./routers/routes');
require('./config/connection');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3003;

app.use(cors({ origin: "*", credentials: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/', routes);

// Teste de conexão com o banco
app.get('/test-db', async (req, res) => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PWD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        await connection.query("SELECT 1");
        res.status(200).json({ message: "✅ Conexão bem-sucedida!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Middleware de erro
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo deu errado!' });
});

// Exportar o app para a Vercel
module.exports = app;

