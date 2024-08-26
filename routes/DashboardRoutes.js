const express = require("express")

const router = express.Router()

const dashboardController = require("../controllers/DashboardController")

//************DASHBOARD************//

//ADD TRANSACTİON
//Kullanıcıların yapmış olduğu son işlemleri kaydetme işlemi.
router.route("/data/transaction").post(dashboardController.addTransaction )

//TRANSACTION - GENDER
//Cinsiyet verilerini çekme işlemi 
router.route("/data/transaction/gender").get(dashboardController.userGender)

//ORDER - EMAIL
//Verileri email adresine göre sıralama işlemi
router.route("/data/transaction/orderEmail").get(dashboardController.orderEmailDashboard)


//ORDER - NAME
//Verileri ad-soyad göre sıralama işlemi
router.route("/data/transaction/orderName").get(dashboardController.orderNameDashboard)


//TRANSACTION 
//Değişiklik yapılan kullanıcıları çekme işlemi.
router.route("/data/transaction/:q").get(dashboardController.getAllTransaction)

module.exports = router