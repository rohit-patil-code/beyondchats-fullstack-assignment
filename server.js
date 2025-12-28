require("dotenv").config();

const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

pool
    .query('SELECT 1')
    .then(() => {console.log('Successfully connected Databse!')})
    .catch((err) => {
        console.log(`PostgreSQL connection failed with error message: ${err.message}`);
        process.exit(1);
    });

app.listen(PORT, () => {
    console.log(`Listening to port: ${PORT}`);
});