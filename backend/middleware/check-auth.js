const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

const authenticate = (req, res, next) => {
    // console.log(req.header('authorization'));  SAME THING!
    // console.log(req.headers.authorization);    SAME THING!

    try {
    const token = req.headers.authorization.split(' ')[1];   //bearer 1234
          const decodedToken = jwt.verify(token, process.env.JWT_KEY);
          req.userData = { email: decodedToken.email, userId: decodedToken.userId }
          next();
    } catch (err) {
        res.status(401).json({ message: 'Auth failed' });
    }

}

module.exports = authenticate;