const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const path = require('path');  //need to map backend/images to /images

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useNewUrlParser: true }).then(() => console.log('MongoDB connected')).catch(err => console.log(err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//to make images folder accessible
app.use('/images', express.static(path.join('backend/images')));  //any req targeting /images will be forwarded to backend/images and allowed to continue

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, X-Requested-With, Authorization');  //Authorization is where we put token in header on front end, we had to add Authorization here
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    next();
});


app.use('/api/posts', postRoutes);
app.use('/api/user', userRoutes);


module.exports = app;