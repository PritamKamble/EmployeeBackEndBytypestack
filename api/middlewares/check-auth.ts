import jwt from 'jsonwebtoken';

export function checkAuth() {
    console.log('req.headers.authorization');
    return '';
    // try {
    //     const token = req.headers.authorization.split(' ')[1];
    //     const decoded = jwt.verify(token, "secret");
    //     next();
    // } catch (error) {
    //     return res.status(401).json({
    //         message: 'Token Missing',
    //         error: error
    //     });
    // }
};