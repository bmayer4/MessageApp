const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const keys = require('../config/keys');

exports.createUser = (req, res) => {

    bcrypt.hash(req.body.password, 10).then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save().then(result => {
            res.status(201).json({
                message: 'User created',
                result
            });
        }).catch(err => {
            res.status(500).json({ message: 'Unable to signup' });
        })
    });
}

exports.userLogin = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    let fetchedUser;

    User.findOne({ email }).then(user => {
        if (!user) {
            return res.status(404).json({ message: 'Auth failed' });
        }
        fetchedUser = user;
        return bcrypt.compare(password, user.password).then(result => {
            if (!result) {
                return res.status(404).json({ message: 'Auth failed' });
            }

            const token = jwt.sign({ email: fetchedUser.email, userId: fetchedUser._id }, process.env.JWT_KEY, { expiresIn: "3h" });
            res.status(200).json({ token, expiresIn: 10800, userId: fetchedUser._id });  //better than decoding userId on front end

        }).catch(e => {
            return res.status(404).json({ message: 'Auth failed' });
        });
    }).catch(err => res.json(err));
}