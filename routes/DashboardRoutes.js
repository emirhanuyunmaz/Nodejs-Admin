const express = require("express")

const router = express.Router()

const dashboardController = require("../controllers/DashboardController")

//ADD TRANSACTİON
//Kullanıcıların yapmış olduğu son işlemleri kaydetme işlemi.
router.route("/api/data/transaction").post(dashboardController.addTransaction )

//TRANSACTION - GENDER
//Cinsiyet verilerini çekme işlemi 
router.route("/api/data/transaction/gender").get(dashboardController.userGender)

//TRANSACTION 
//Değişiklik yapılan kullanıcıları çekme işlemi.
router.route("/api/data/transaction/:q").get(dashboardController.getAllTransaction)

module.exports = router