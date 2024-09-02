const mongoose = require("mongoose")

//**************PRODUCT - MODEL****************//
//Ürün listesinin tutulduğu yapı
const productSchema = new mongoose.Schema({
    personId:String,
    name:String,
    price:String,
    amount:String,
    images:[],
})

const Product = mongoose.model("Product",productSchema)

module.exports = Product