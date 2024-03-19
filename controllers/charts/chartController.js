const { stdin } = require('process');
const input = process.openStdin();
const {Chart, ChartsType,Group} = require('../../model/models');
const { validationResult } = require('express-validator');


module.exports.index = async (req,res) =>{
    let path = req.path 
    const chartsTypes = await ChartsType.getAll();
    const groups = await Group.getAll();
    let admin = await Group.findOne('admin');
    if (admin){
        if (admin._id == req.session.group){
            admin = true;
        }else{
            admin = false;
        }
    }
  
    const errors = req.query.error ? [req.query.error] : [];
    const alert = req.query.exito ? [req.query.exito] : [];
    res.render('index',{chartsTypes,groups,admin,path,errors,alert})
}

module.exports.getAll = async (req,res)=>{
    let userId = req.session.user
    const charts = await Chart.getAll(userId);
    res.send(charts);
}

module.exports.newGraf = async (req,res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        const queryString = `error=${encodeURIComponent(firstError.msg)}`;
        //const queryString = errors.array().map(error => `error=${encodeURIComponent(error.msg)}`).join('&');
        return res.redirect(`/home?${queryString}`);
        //return res.status(400).json({ errors: errors.array() });
     }
    let data = req.body;
    data.userId = req.session.user
    if (data.opacity == ''){
        data.opacity = 0.5;
    }
    let opacity = convertToHex(data.opacity)
    data.backgroundColor1 = data.backgroundColor1 + opacity
    data.backgroundColor2 = data.backgroundColor2 + opacity
    data.backgroundColor = [];
    data.backgroundColor.push(req.body.backgroundColor1);
    data.backgroundColor.push(req.body.backgroundColor2);
    if (data.percent != ''){
        data.percent = data.percent / 2;
    }else{
        delete data.percent
    }
    if (data.maxValue == ''){
        data.maxValue = 100;
    }

    delete data.backgroundColor1;
    delete data.backgroundColor2;
    let save = await Chart.createOne(data);
    if (save){
        queryString = `exito=${encodeURIComponent('Se creo la grafica con exito')}`
        res.redirect(`/home?${queryString}`)
    }
    
}

module.exports.delGraf = async (req,res) =>{
    let id = req.body.id
    let del = await Chart.deleteOne(id);
    if (del){
        res.send({"status":"true"})
    }else{
        res.send({"status":"false"})
    }
    console.log(del)
    
}

function convertToHex(x) {
    if (x < 0.1 || x > 1) {
       console.error("El valor debe estar en el rango de 0.1 a 1");
       return;
    }
    let valorEscalado = (x - 0.1) * (255 - 1) / (1 - 0.1) + 1;
    let hexadecimal = Math.round(valorEscalado).toString(16);
    while (hexadecimal.length < 2) {
       hexadecimal = '0' + hexadecimal;
    }
    return hexadecimal;
}