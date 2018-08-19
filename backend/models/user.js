const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true   //unique does not validate input (unlike required),
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.plugin(uniqueValidator);  //now we will get an error if we try to add an existing email

module.exports = mongoose.model('User', userSchema);