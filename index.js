const express = require('express')
const app = express()
const cors = require("cors")//herhangi bir veri aktarımı öncesinde talebin onaylanıp onaylanmadığının üçüncü taraf sunucularla kontrolünü sağlar
//const mongodb = require("mongodb")//Verileri bir veri tabanında tutmak için kullanılacak
const mongoose = require("mongoose")//Bu sayede hem veritabanı oluşturuyoruz hem de veri ekleme ve çıkartma işlemi yapıyoruz.

const fs = require("fs")

//***************************** */
main().catch(err => console.log(err));

//Resim ekleme işlemi için yeni bir yer eklenecek
const userSchema = new mongoose.Schema({
    id:Number,
    name:String,
    email:String,
    password:String,
    image:String
})

const user = mongoose.model("User",userSchema)

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/test').then(() => console.log("MongoDB connected"));
}

//**************************** */


const PORT = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json({limit:"50mb"})) //Bu limit değerleri sayesinde verilerin belli bir boyuta kada kabul etmesini sağlar
app.use(express.text({ limit: "200mb" }))


//GET
//Kullanıcıları listeleme işlemi...
app.get(`/api/data`,async(req,res)=>{
    let data;
    await user.find().then((users) => data = users)
    //console.log(data);
    res.status(200).json(data)

});

//POST
//Burada yeni veri ekleme işlemi yapılmaktadır.
app.post('/api/data', async(req, res) => {
    // req.body.name ile request 'in body sindeki json nesneye erişilir.
    
    //Burada header kısmını kaldırıp base64 yapısındaki resmi png formatına cevirdik.
    let base64Image = req.body.image.split(';base64,').pop();
    fs.writeFile('image.png', base64Image, {encoding: 'base64'}, function(err) {
        console.log('File created');
    });
    
    const newUser = new user({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        image:req.body.image
    })
    newUser.save().then(() => console.log("saved user")).catch((err) => console.log(err))
    
    console.log("eklemek için istek atıldı");
    res.status(201).json(newUser);
});

//DELETE
//kullanıcı silme işlemi
app.delete(`/api/data/:id`,(req,res) => {
    console.log("silmek için istek atıldı...");
    const id = req.params.id;
    user.deleteOne({_id:id})
    .then(() => console.log("user deleted"))
    .catch((err) => console.log(err))
    res.status(201).json("succes");
})

//SINGLE USER
app.get(`/api/data/user/:id`,async(req,res) => {
    console.log("kullanıcı detay sayfası için veri");
    let data; 
    const userID = req.params.id;
    //console.log(userID);
    await user.find().where("_id").equals(`${userID}`).exec().then((singleUser) => data = singleUser)
    res.status(201).json(data)
})

//SEARCH
//Kullanıcılar arasında ismi girilen kişiyi bulma işlemi.
app.get(`/api/data/:q`,async(req,res) => {
    let data;
    const searchText = req.params.q
    //console.log(searchText);
    console.log("arama yapıldı");
    await user.find().where("name").equals(`${searchText}`).exec().then((users) => data = users)
    //console.log(data);
    res.status(200).json(data)
})

//Server çalışması
app.listen(PORT, ()=> {
    console.log(`Server runing ${PORT}`)
})