const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const postRoutes = require('./routes/posts');
const mongoose = require('mongoose');
const keys = require('./config/keys');


mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI).then(() => console.log('MongoDB connected')).catch(err => console.log(err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, X-Requested-With');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    next();
});


app.use('/api/posts', postRoutes);


module.exports = app;