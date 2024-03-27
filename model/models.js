require('./db');
require('dotenv').config()
const { mongo, default: mongoose, Schema, model, isObjectIdOrHexString } = require('mongoose');
const Bcrypt = require('bcryptjs');
//esquema para grupos
const groupSchema = new mongoose.Schema({
  group:{
    type: String,
    unique: true,
    required: true,
  }  
})
const grgoupModel = mongoose.model('Group',groupSchema);

//esquema para los usuarios 
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type : String,
        required: true,
    },
    group: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: grgoupModel
    }
});
const UserModel = mongoose.model('User',userSchema);

//esquema para los tipos de graficas
const chartTypeScchema = new mongoose.Schema({
    chartType:{
        type: String,
        unique: true,
    }
})
const chartTypeModel = new mongoose.model('ChartType',chartTypeScchema);

//esquema para las graficas
const chartScchema = new mongoose.Schema({

    type:{ 
        type: Schema.Types.ObjectId,
        required: true,
        ref: chartTypeModel,
    },
    labels: {
        type: String,
        unique: false
    },
    backgroundColor:{
        type: Array,
        unique: false
    },
    suggestedMax:{
        type: String,
        unique: false
    },
    topic:{
        type: String,
        unique : false,
    },
    percent:{
        type: Number,
        unique: false,
        default: 50,
    },
    maxValue:{
        type: Number,
        unique: false,
        default: 100,
    },
    userId:{ 
        type: Schema.Types.ObjectId,
        required: true,
        ref: UserModel,
    },
})
const ChartModel = new mongoose.model('Chart',chartScchema);

const deviceSchema = new mongoose.Schema({
    name:{
        type: String,
    },
    mac:{
        type: String,
        unique: true
    },
    userId:{ 
        type: Schema.Types.ObjectId,
        required: true,
        ref: UserModel,
    },

});
const DeviceModel = new mongoose.model('Devices', deviceSchema);

const controlSchema = new mongoose.Schema({
    deviceId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: DeviceModel,
    },
    buttons: {
        type: Array,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        default: 'command'
    }
});
const ControlModel = new mongoose.model('Controls',controlSchema);

class Users{
    static async findOne(username){
        try {
            const user = await UserModel.findOne({'username':username}).populate('group');
            if (user){
                return user;
            }else{
                return false;
            }
            
        } catch (error) {
            console.error(new Error(error))
        }
    }

    static async getAll(){
        try {
            let all = await UserModel.find().populate('group');
            return all;
        } catch (error) {
            console.error(new Error(error))
        }
    }

    static async createOne(data){
        try {
            var newUser = data.username;
            newUser = await Users.findOne(newUser);
            if (newUser.id != null){
                return console.error(new Error('Usuario ya existe'))
            }else{
                newUser = await UserModel(data);
                await newUser.save();
            }
            return newUser
        } catch (error) {   
            console.error(new Error(error))
        }
    }

    static async deleteOne(id){
        try {
            const del = await UserModel.deleteOne({_id:id});
            return del;
        } catch (error) {
            console.error(new Error(error))
        }
    }

};

class Chart{
    static async getAll(userId){
        try {
            const all = await ChartModel.find({userId:userId}).populate('type');
            return all;
        } catch (error) {
            console.error(new Error(error));
        }
    }
    static async createOne(data){
        try {
            var newChart = data;
            newChart = await ChartModel(data);
            await newChart.save();
            return true
        } catch (error) {   
            console.error(new Error(error))
            return false
        }
    }
    static async deleteOne(id){
        try {
            var del = await ChartModel.deleteOne({_id:id});
            return true;
        } catch (error) {
            console.error(new Error(error));    
            return false        
        }
    }
};

class ChartsType{
    static async getAll(){
        try {
            const all = await chartTypeModel.find();
            return all;
        } catch (error) {
            console.error(new Error(error));
        }
    }
    static async findOne(obj){
        try {
            const type = await chartTypeModel.findOne({chartType:obj});
            return type
        } catch (error) {
            console.error(new Error(error));
        }
    }
};

class Group{
    static async findOne(obj){
        try {
            const group = await grgoupModel.findOne({group:obj});
            return group
        } catch (error) {
           console.error(new Error(error)); 
        }
    }
    static async getAll(){
        try {
           const all = await grgoupModel.find();
           return all
        } catch (error) {
            console.error(new Error(error))
        }
    }
}

class Device{
    static async getAll(userId){
        try {
            let all = await DeviceModel.find({userId:userId});
            return all;
        } catch (error) {
            console.error(new Error(error));
        }
    }

    static async createOne(data){
        try {
            let valid = await DeviceModel.findOne({mac:data.mac})
            if (!valid){
                let newDevice = await DeviceModel(data);
                await newDevice.save() 
                return newDevice;
            }else{
                return false;
            }
     
        } catch (error) {
            console.error(new Error(error));
            return false;
        }
    };
};

class Control{
    static async getAll(userId) {
        try {
            const id = new mongoose.Types.ObjectId(userId);
            const all = await ControlModel.aggregate([
                {
                    $lookup:{
                        from: "devices",
                        localField: "deviceId",
                        foreignField: "_id",
                        as: "controlInfo"
                    }
                },
                {
                    $unwind: "$controlInfo"
                },
                {
                    $match:{
                        "controlInfo.userId" : id
                    }
                },
                {
                    $project:{
                        controlInfo: 0
                    }
                }
 
            ]);
            return all;
        } catch (error) {
            console.error(new Error(error));
        }
    }

    // static async getAll(userId){
    //     try {
    //         const all = await ControlModel.find({userId:userId});
    //         return all;
    //     } catch (error) {
    //         console.error(new Error(error));
    //     }
    // }

    static async createOne(data){
        try {
            const newControl = await ControlModel(data);
            await newControl.save();
            return newControl;
        } catch (error) {
            console.error(new Error(error));
            return false;
        }
    }
};

data = JSON.parse(process.env.CHARTS_TYPES)
async function create(){
    data.forEach(async element => {
        let valid = await ChartsType.findOne(element.chartType);
        if (valid == null){
            let newType = await chartTypeModel(element);
            newType.save()
        }else{
            console.info('Ya existe el tipo de grafica: '+element.chartType)
        }
    });
    //d = await chartTypeModel.insertMany(data);
    //r = await Charts.deleteOne(d)
    //console.log(d)
}

create();

const groups = [
    {group: 'admin'},
    {group: 'std'},
]

const createGroup = async (groups)=>{
    const valid = await Group.findOne(groups[0].group);
    if (!valid){
        try {
           await grgoupModel.insertMany(groups);
           console.log('Grupos creados')
        } catch (error) {
          console.error(new Error(error))  
        }
    }
}
createGroup(groups).then(()=>{
    const admin = {
        username : "admin",
        password : Bcrypt.hashSync('debian',10)
    }
    const createAdmin = async (admin) =>{
        const group = await Group.findOne('admin');
        admin.group = group._id
        let newAdmin;
        const valid = await Users.findOne(admin.username);
        valid ? console.info('User admin encontrado') : newAdmin = await Users.createOne(admin);
        newAdmin ? console.info('Ususrio admin creado con exito') : console.log('================================================')
    }
    createAdmin(admin)
})









module.exports = {Users,Chart,ChartsType,Group,Control,Device}
