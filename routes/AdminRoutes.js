
const express = require("express")

const router = express.Router()

const adminFuction = require("../controllers/AdminController")

//POST
//Burada yeni veri ekleme işlemi yapılmaktadır.
router.route("/data").post(adminFuction.addNewUser)

//GET USER LENGTH
//Tüm kullanıcıların sayısını veren ve sayfalama da kullanılan yapı
router.route("/data/length").get(adminFuction.getUsersLength)

//GET USER EMAIL ORDER
//Tüm kullanıcıları email adreslerine göre harflere göre sıralama işlemi...
router.route("/data/emailOrder/:page").get(adminFuction.orderEmailUser)

//GET USER NAME ORDER
//Tüm kullanıcıları email adreslerine göre harflere göre sıralama işlemi...
router.route("/data/nameOrder/:page").get(adminFuction.orderNameUser)

//ADMIN
//SEARCH
//DB içerisindeki tüm verilerin çekilmesi işlemi ...
router.route("/data/allData/:search").get(adminFuction.allDataSearch)

//ADMIN
//SINGLE USER
router.route("/data/user/:id").get(adminFuction.singleUser)

//ADMIN
//GET ALL USER
//Kullanıcıları listeleme işlemi...
router.route("/data/:page").get(adminFuction.getAllData)

//DELETE
//kullanıcı silme işlemi
router.route("/data/:id").delete(adminFuction.deleteUser)

//UPDATE
//Kayıtlı bir kullanıcıyı güncelleme işlemi 
router.route("/data/user/:id").post(adminFuction.updateUser)

module.exports = router