const {Chart, ChartsType,Group} = require('../../model/models');
const { validationResult } = require('express-validator');


module.exports.index = async (req,res) => {
    path = req.path
    const error = req.cookies.error;
    const exito = req.cookies.exito;
    let admin = await Group.findOne('admin');
    if (admin){
        if (admin._id == req.session.group){
            admin = true;
        }else{
            admin = false;
        }
    }
    res.clearCookie('error');
    res.clearCookie('exito');
    res.render('control/index',{admin,path,error,exito})
}