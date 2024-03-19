require('dotenv').config()
const jwt = require('jsonwebtoken');


const secretJwt = process.env.JWT

module.exports.auth = (req,res,next) =>{
    let authToken = req.cookies.authToken;
    if (authToken){
        jwt.verify(authToken,secretJwt, (err, decoded) =>{
            if (err){
                console.log(err)
                res.status(401).json({ status: "error", message: "Autenticación fallida" });
            }else{
                req.session.user = decoded.id;
                req.session.group = decoded.group;
                next()
            }
        })
    }else{
        res.status(401).render('login',{ status:{error: true, message: "Autenticación requerida"}});
    }

}



