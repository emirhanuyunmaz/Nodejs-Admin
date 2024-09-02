const express = require("express")
const router = express.Router()
const product = require("../controllers/ProductController")


//PRODUCT ADD
//Yeni bir ürün ekleme işlemi.
router.route("/newProduct").post(product.newProduct)

//GET ALL PRODUCT
//Tüm ürünlere ait listenin gelmesi işlemi
router.route("/searchProduct/:productName").get(product.searchProductName)

//GET ALL PRODUCT
//Tüm ürünlere ait listenin gelmesi işlemi
router.route("/productList/:page").get(product.getAllData)

//PRODUCT SINGLE GET
//Yeni bir ürün ekleme işlemi.
router.route("/singleProduct/:id").get(product.getSingleProduct)

//PRODUCT SINGLE GET
//Yeni bir ürün ekleme işlemi.
router.route("/productLength/:page").get(product.getAllDataLength)

//PRODUCT SINGLE DELETE
//Bir ürünü silme işlemi.
router.route("/singleProduct/:id").delete(product.deleteProduct)

//PRODUCT GET IMAGE
//Yeni bir ürün ekleme işlemi.
router.route("/productImage/:number/:id").get(product.getImage)

//PRODUCT DELETE IMAGE
//Bir ürün silme işlemi.
router.route("/productImage/:number/:id").delete(product.deleteSingleProductImages)

module.exports = router