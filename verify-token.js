const jwt = require('jsonwebtoken');

const PORT = 3000, SECRET_KEY = 'abc', TOKEN_HEADER = 'auth';


function verifyToken(req, res, next) {
    try {
        const token = req.header(TOKEN_HEADER);

        const verified = jwt.verify(token, SECRET_KEY);

        if (verified) {
            req.user = verified.user;
            req.role = verified.role;
            next();
        } else {
            return res.status(401).json({ error: 'Access denied' });
        }
    } catch (error) {
        return res.status(401).json({ error: 'Access denied' });
    }
}

module.exports = verifyToken;