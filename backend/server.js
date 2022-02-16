const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const userRoutes = require('./routes/user.routes');
const sauceRoutes = require('./routes/sauce.routes');
const path = require('path');

require('dotenv').config({path: './config/.env'})
require('./config/db');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });
app.use('/images', express.static(path.join(__dirname,'images')));
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

app.listen(process.env.PORT, () => {
    console.log('Listening on port 3000')
}
)