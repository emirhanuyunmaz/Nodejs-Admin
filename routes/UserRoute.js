const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const User = require("../models/UserModel")
const userController = require("../controllers/UserController")

//User-Detail
//Giriş yapan kullanıcıya ait detay sayfası
router.route("/api/data/userDetail").get(userController.userDetail)


//SIGN UP = GİRİŞ YAPMA İŞLEMİ
router.route("/api/data/signUp").post(userController.userSignIn)


module.exports = router