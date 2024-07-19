const express = require('express')
const app = express()
const cors = require("cors")//herhangi bir veri aktarımı öncesinde talebin onaylanıp onaylanmadığının üçüncü taraf sunucularla kontrolünü sağlar
//const mongodb = require("mongodb")//Verileri bir veri tabanında tutmak için kullanılacak
const mongoose = require("mongoose")//Bu sayede hem veritabanı oluşturuyoruz hem de veri ekleme ve çıkartma işlemi yapıyoruz.

//Cookie çekme ve kaydetme işlemi ...
const cookieParser = require("cookie-parser")

main().catch(err => console.log(err));

//Veritabanına bağlanma işlemi.
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/test').then(() => console.log("MongoDB User connected"));
}
//Çalışacağı port
const PORT = process.env.PORT || 5000;

//middleware
app.use(cors({credentials: true , origin: true}))//Buradaki credentials ve origin verileri sayesinde cookies verileri çekilebilmektedir.
app.use(express.json({limit:"50mb"})) //Bu limit değerleri sayesinde verilerin belli bir boyuta kada kabul etmesini sağlar
app.use(express.text({ limit: "200mb" }))
require("dotenv").config()
app.use(cookieParser()) //Cookie işlemleri için gerekli olan middleware

//ADMIN
//ROUTES
const adminRoute = require("./routes/AdminRoutes")
app.use("/api/admin",adminRoute)

//DASHBOARD
//ROUTES 
const dashboardRoute = require("./routes/DashboardRoutes")
app.use("/api/dashboard",dashboardRoute)

//USER
//ROUTES
const userRoute = require("./routes/UserRoute")
app.use("/api/user",userRoute)

//SERVER RUNING
//Server çalışması
app.listen(PORT, ()=> {
    console.log(`Server runing ${PORT}`)
})