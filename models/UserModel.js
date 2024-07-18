const mongoose = require("mongoose")

//Kullanıcı ekleme işlemi için kullanılacak şema
const userSchema = new mongoose.Schema({
    id:Number,
    name:String,
    surname:String,
    email:String,
    password:String,
    image:String,
    gender:Number,
    birthDay:String,
    phoneNumber:Number
})

const User = mongoose.model('User', userSchema);
module.exports = User