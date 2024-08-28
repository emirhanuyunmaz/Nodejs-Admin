const mongoose = require("mongoose")
const Transaction = require("../models/TransactionModel")
const User = require("../models/UserModel")

//*******************ADD TRANSACTION*****************//
//Yapılan işlemleri kaydedecek fonk.
const addTransaction = (req,res) => {

    console.log("İşlem eklemek için istek atıldı");

    try{
        const newTransaction = new Transaction({
            id:req.body.id,
            name:req.body.name,
            surname:req.body.surname,
            email:req.body.email,
            transaction:req.body.transaction,
            transactionTime:Date.now()
        })
        newTransaction.save().then(() => console.log("Saved transaction")).catch((err) => console.log(err))
        res.status(201).json(newTransaction)
    }catch(e){
        res.status(404).json(e)
    }
}

//************ ALL TRANSACTION *********************//
//Yapılan tüm işlemleri veren fonk.
const getAllTransaction = async (req,res) => {
    let data ;
    console.log("İşlemleri çekmek için istek atıldı");
    let q = req.params.q
    console.log("TRANSACTION Q::"+q);
    if(q !== "All"){
        try{
            await Transaction.find().where("transaction").equals(q).sort("-transactionTime").exec().then((dataList) => data = dataList).catch(() => console.log("data get err"))
            res.status(201).json(data)
        }catch(e){
            res.status(404).json(e)
        }
    }else{
        try{
            await Transaction.find().sort("-transactionTime").exec().then((dataList) => data = dataList).catch(() => console.log("data get err"))
            res.status(201).json(data)
        }catch(e){
            res.status(404).json(e)
        }

    }
}

//******************USER - GENDER******************//
//Kullanıcı cinsiyet dağılımını veren fonks.
const userGender = async (req,res) => {
    let womanCounder = 0
    let manCounter = 0
    let data = {
        woman:0,
        man:0
    }
    console.log("Cinsiyet sayısını çekmek için istek atıldı");
    //JWT => Token işlemleri için
    try{
        await User.find().then((dataList) => {
            dataList.forEach((item) => {
                if(item.gender === 0){
                    manCounter ++
                }else{
                    womanCounder ++ 
                }
            })
            data.man = manCounter
            data.woman = womanCounder
        }).catch(() => console.log("data get err"))
        res.status(201).json(data)
    }catch(e){
        res.status(404).json(e)
    }
}

const orderNameDashboard = async(req,res) => {
    let data ;
    console.log("İşlemleri sıralama için istek atıldı");
    let q = req.params.q
    console.log("TRANSACTION Q::"+q);
    if(q !== "All"){
        try{
            await Transaction.find().sort({name:1}).sort("-transactionTime").exec().then((dataList) => data = dataList).catch(() => console.log("data get err"))
            res.status(201).json(data)
        }catch(e){
            res.status(404).json(e)
        }
    }else{
        try{
            await Transaction.find().sort("-transactionTime").sort({name:1}).exec().then((dataList) => data = dataList).catch(() => console.log("data get err"))
            res.status(201).json(data)
        }catch(e){
            res.status(404).json(e)
        }

    }
}

const orderEmailDashboard = async(req,res) => {
    let data ;
    console.log("İşlemleri sıralama için istek atıldı");
    let q = req.params.q
    console.log("TRANSACTION Q::"+q);
    if(q !== "All"){
        try{
            await Transaction.find().sort({email:1}).sort("-transactionTime").exec().then((dataList) => data = dataList).catch(() => console.log("data get err"))
            res.status(201).json(data)
        }catch(e){
            res.status(404).json(e)
        }
    }else{
        try{
            await Transaction.find().sort("-transactionTime").sort({email:1}).exec().then((dataList) => data = dataList).catch(() => console.log("data get err"))
            res.status(201).json(data)
        }catch(e){
            res.status(404).json(e)
        }

    }
}

module.exports = {addTransaction , getAllTransaction , userGender , orderEmailDashboard , orderNameDashboard}