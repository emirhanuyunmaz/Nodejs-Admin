
const express = require("express")

const router = express.Router()

const adminFuction = require("../controllers/AdminController")


//POST
//Burada yeni veri ekleme işlemi yapılmaktadır.
router.route("/api/data").post(adminFuction.addNewUser)
//GET USER LENGTH
//Tüm kullanıcıların sayısını veren ve sayfalama da kullanılan yapı
router.route("/api/data/length").get(adminFuction.getUsersLength)

//ADMIN
//SEARCH
//DB içerisindeki tüm verilerin çekilmesi işlemi ...
// app.get("/api/data/allData/:search" , )
router.route("/api/data/allData/:search").get(adminFuction.allDataSearch)

//ADMIN
//GET ALL USER
//Kullanıcıları listeleme işlemi...
router.route("/api/data/:page").get(adminFuction.getAllData)

//ADMIN
//SINGLE USER
router.route("/api/data/user/:id").get(adminFuction.singleUser)


//DELETE
//kullanıcı silme işlemi
router.route("/api/data/:id").delete(adminFuction.deleteUser)

//UPDATE
//Kayıtlı bir kullanıcıyı güncelleme işlemi 
router.route("/api/data/:id").post(adminFuction.updateUser)



module.exports = router

