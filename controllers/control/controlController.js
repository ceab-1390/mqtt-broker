const {Chart, ChartsType,Group,Control,Device} = require('../../model/models');
const { validationResult } = require('express-validator');


module.exports.index = async (req,res) => {
    path = req.path
    const error = req.cookies.error;
    const exito = req.cookies.exito;
    let admin = await Group.findOne('admin');
    let devices = await Device.getAll(req.session.user);
    if (admin){
        if (admin._id == req.session.group){
            admin = true;
        }else{
            admin = false;
        }
    }
    res.clearCookie('error');
    res.clearCookie('exito');
    res.render('control/index',{admin,path,error,exito,devices})
}

module.exports.controls_data = async (req,res) =>{
    let userId = req.session.user
    const controls = await Control.getAll(userId);
    //console.log(controls)
    res.send(controls);
}

module.exports.newControl = async (req,res) => {
    let arrayButoon = [];
    let items = {}
    let cantButoon = req.body.buttons;
    for (let i = 1 ; i <= cantButoon ; i++){
        let item = 'B'+i
        items['button'] = req.body[item];
        items['action'] = i
        arrayButoon.push(items)
        items = {}
        delete req.body[item];
    }
    req.body.buttons = arrayButoon;
    const newControl = await Control.createOne(req.body);
    if (newControl){
        res.cookie('exito', 'Se creo el control con exito', { httpOnly: true });
        res.redirect('/control');
    }else{
        res.cookie('error', 'Error no se creo el control', { httpOnly: true });
        res.redirect('/control');

    }
}