const Bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const model = require('../../model/models');

const secretJwt = process.env.JWT

module.exports.login = (req,res) =>{
    res.clearCookie('authToken');
    res.render('login',{status:{error: false, message: null}, layout: false})
}

module.exports.auth = async (req,res) =>{
    let token;
    if (req.body.user != '' && req.body.password != ''){
        try {
            user = await model.Users.findOne(req.body.user);
            if (user){
                let validPass = Bcrypt.compareSync(req.body.password,user.password);
                validPass ? token = jwt.sign({user:user.username, id:user._id, group: user.group._id}, secretJwt, { expiresIn: '1h' }) : token = false;
                setCockie(token,user)
            }
            async function setCockie(obj,user){
                if (!token){
                    res.render('login',{status:{error: true, message: ""}}) 
                }else{
                    res.status(200).cookie('authToken',obj,{ maxAge: 3600 * 1000, httpOnly: true } ).redirect('/home')
                }
            }
        } catch (error) {
            console.error(new Error(error))
        }
    }else{
        res.render('login',{status:{error: true, message: "Ingrese usuario y contrasena"}}) 
    }
}

module.exports.logOut = (req,res) =>{
    res.send('hola')
}

module.exports.index = async (req,res) =>{
    let path = req.path
    const groups = await model.Group.getAll();
    let admin = await model.Group.findOne('admin');
    const users = await model.Users.getAll();
    if (admin){
        if (admin._id == req.session.group){
            admin = true;
        }else{
            admin = false;
        }
    }
    res.render('users',{admin,users,path,groups})
}