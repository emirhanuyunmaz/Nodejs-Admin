const express = require('express')
const app = express()
const cors = require("cors")//herhangi bir veri aktarımı öncesinde talebin onaylanıp onaylanmadığının üçüncü taraf sunucularla kontrolünü sağlar
//const mongodb = require("mongodb")//Verileri bir veri tabanında tutmak için kullanılacak
const mongoose = require("mongoose")


//***************************** */
main().catch(err => console.log(err));
const userSchema = new mongoose.Schema({
    id:Number,
    name:String,
    email:String,
    password:String
})

const user = mongoose.model("User",userSchema)

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/test').then(() => console.log("MongoDB connected"));

    //Yeni kullanıcı oluşturma işlemi.
    // const newUser = new user({
    //     id:6,
    //     name:"ali",
    //     email:"a@gmail.com",
    //     password:"asdasd31a32sd13a1"
    // })
    
    //Kullanıcı kaydetme işlemi.
    //newUser.save().then(() => console.log("saved user")).catch((err) => console.log(err))

    //Tüm kullanıcıları listeleme işlemi
    // user.find().then((users) => console.log(users))

}

//**************************** */


const PORT = process.env.PORT || 5000;



//middleware
app.use(express.json());
app.use(cors())


//Kullanıcıları listeleme işlemi...
app.get(`/api/data`,async(req,res)=>{
    let data;
    await user.find().then((users) => data = users)
    //console.log(data);
    res.status(200).json(data)

});

//Burada yeni veri ekleme işlemi yapılmaktadır.
app.post('/api/data', (req, res) => {
    // req.body.name ile request 'in body sindeki json nesneye erişilir.
    const newUser = new user({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
    })
    newUser.save().then(() => console.log("saved user")).catch((err) => console.log(err))
    
    console.log("eklemek için istek atıldı");
    res.status(201).json(newUser);
});

//kullanıcı silme işlemi
app.delete(`/api/data/:id`,(req,res) => {
    console.log("silmek için istek atıldı...");
    const id = req.params.id;
    user.deleteOne({_id:id})
    .then(() => console.log("user deleted"))
    .catch((err) => console.log(err))
})

app.listen(PORT, ()=> {
    console.log(`Server runing ${PORT}`)
})