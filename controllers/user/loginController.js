const Bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const model = require('../../model/models');
const { validationResult } = require('express-validator');


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
                    res.render('login',{status:{error: true, message: "Usuario o Clave no valida"}, layout: false}) 
                }else{
                    res.status(200).cookie('authToken',obj,{ maxAge: 3600 * 1000, httpOnly: true } ).redirect('/home')
                }
            }
        } catch (error) {
            console.error(new Error(error))
        }
    }else{
        res.render('login',{status:{error: true, message: "Ingrese usuario y contrasena"}, layout: false}) 
    }
}

module.exports.logOut = (req,res) =>{
    res.send('hola')
}

module.exports.index = async (req,res) =>{
    let path = req.path
    const error = req.cookies.error;
    const exito = req.cookies.exito;
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
    res.clearCookie('error');
    res.clearCookie('exito');
    res.render('users',{admin,users,path,groups,error:error, exito:exito})
}

module.exports.createUser = async (req,res) => {
    const errors = validationResult(req)
    if (req.body.password != req.body.password_v){
        res.cookie('error', "Las contrasenas no coinciden", { httpOnly: true });
        return res.redirect('/users');
    }else if (errors.errors != ''){
        res.cookie('error', errors.errors[0].msg, { httpOnly: true });
        return res.redirect('/users');
    }else{
        const valid = await model.Users.findOne(req.body.username);
        if (!valid){
            req.body.password = Bcrypt.hashSync(req.body.password,10)
            const newUser = await model.Users.createOne(req.body);
            res.cookie('exito', 'Se creo el usuario', { httpOnly: true });
            return res.redirect('/users')
        }else{
            res.cookie('error', 'El usuario ya existe', { httpOnly: true });
            return res.redirect('/users')
        }
    }
    
}

module.exports.deleteUser = async (req,res) => {
    let id = req.params.id;
    let deleted = await model.Users.deleteOne(id);
    res.cookie('exito', "Se elimino el usuario", { httpOnly: true });
    return res.redirect('/users'); 
}