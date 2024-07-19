const mongoose = require("mongoose")

//**************TRANSACTION - MODEL****************//
//Yapılan son işlemleri tutacak veri şeması
const transactionSchema = new mongoose.Schema({
    id:String,
    name:String,
    surname:String,
    email:String,
    transaction:String,
    transactionTime:Number
})

const Transaction = mongoose.model("Transaction",transactionSchema)

module.exports = Transaction