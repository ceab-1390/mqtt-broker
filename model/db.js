require('dotenv').config()
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URI,{
}).then(()=>{
    console.log('DB Conected');
}).catch((err)=>{
    console.error(new Error(err));
});

module.exports = mongoose