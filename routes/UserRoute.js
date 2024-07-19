const express = require("express")
const router = express.Router()
const userController = require("../controllers/UserController")

//****************USER-DETAIL***********************//
//Giriş yapan kullanıcıya ait detay sayfası
router.route("/data/userDetail").get(userController.userDetail)

//******************SIGN UP*******************//
//GİRİŞ YAPMA İŞLEMİ
router.route("/data/signUp").post(userController.userSignIn)

module.exports = router