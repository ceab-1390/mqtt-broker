require('dotenv').config()
const express = require('express');
const router = express.Router();
const charts = require('../controllers/charts/chartController')
const { check, validationResult } = require('express-validator');
const midleware = require('../midleware/auth');
const user = require('../controllers/user/loginController')
const control = require('../controllers/control/controlController');

const chartValidationRules = [
 check('type').notEmpty().withMessage('Debe seleccionar el tipo de grafico'),
 check('percent').matches(/^\d*$/).withMessage('El porcentaje solo puede contener números'), 
 check('maxValue').matches(/^\d*$/).withMessage('El valor maximo solo puede contener números'),
 check('labels').notEmpty().withMessage('La etiqueta es obligatoria')
    .matches(/^[a-zA-Z0-9]+$/).withMessage('La etiqueta solo puede contener letras y números'),
 check('topic').notEmpty().withMessage('El tema es obligatorio')
    .matches(/^[a-zA-Z0-9]+$/).withMessage('El tema solo puede contener letras y números'),
 check('backgroundColor1').notEmpty().withMessage('El color de fondo 1 es obligatorio'),
 check('backgroundColor2').notEmpty().withMessage('El color de fondo 2 es obligatorio'),
 check('opacity').matches(/^(\d+(\.\d+)?)?$/).withMessage('La opacidad solo debe ser numérica')
];

const userValidationRules = [
   check('group').notEmpty().withMessage('Debe seleccionar el tipo de usuario'),
   check('username').notEmpty().withMessage('Debe ingresar el nombre de usuario'),
   check('password').notEmpty().withMessage('Debe ingresar la contrasena'),
]


router.get('/',user.login);
router.post('/login',user.auth);
router.get('/home',midleware.auth,charts.index)
router.get('/charts_data', charts.getAll);
router.post('/newGraf', midleware.auth,chartValidationRules, charts.newGraf);
router.post('/delGraf', charts.delGraf);

router.get('/users', midleware.auth,user.index);
router.post('/users',midleware.auth,userValidationRules,user.createUser);
router.get('/delUser/:id',midleware.auth,user.deleteUser);

router.get('/control',midleware.auth,control.index);

module.exports = router