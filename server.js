require("dotenv").config();

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const articleRouter = require('./src/routes/router');

// const pool = new Pool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// })

// pool
//     .query('SELECT 1')
//     .then(() => {console.log('Successfully connected Databse!')})
//     .catch((err) => {
//         console.log(`PostgreSQL connection failed with error message: ${err.message}`);
//         process.exit(1);
//     });

app.use(express.json());

app.use('/api/articles', articleRouter);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BeyondChats API running 🚀',
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
    console.log(`Listening to port: ${PORT}`);
});

// module.exports = { pool };