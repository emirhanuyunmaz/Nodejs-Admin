const express = require('express')
const app = express()
const cors = require("cors")//herhangi bir veri aktarımı öncesinde talebin onaylanıp onaylanmadığının üçüncü taraf sunucularla kontrolünü sağlar
//const mongodb = require("mongodb")//Verileri bir veri tabanında tutmak için kullanılacak
const mongoose = require("mongoose")//Bu sayede hem veritabanı oluşturuyoruz hem de veri ekleme ve çıkartma işlemi yapıyoruz.

const jwt = require("jsonwebtoken")//Token üretme ve kullanma işlemi için kullanılan kütüphane

const uuid = require("uuid")

const fs = require("fs") 

const cookieParser = require("cookie-parser")

// const authMiddleware = require("./middleware/authMiddleware")


//***************************** */
main().catch(err => console.log(err));

//Kullanıcı ekleme işlemi için kullanılacak şema
const userSchema = new mongoose.Schema({
    id:Number,
    name:String,
    surname:String,
    email:String,
    password:String,
    image:String,
    gender:Number,
    birthDay:String,
    phoneNumber:Number
})

//yapılan son işlemleri tutacak veri şeması
const transactionSchema = new mongoose.Schema({
    id:String,
    name:String,
    surname:String,
    email:String,
    transaction:String,
    transactionTime:Number
})

//Eklenecek olan elemana ait olan eleman yapısı
const user = mongoose.model("User",userSchema)
//Yapılan işlemleri kaydetme işlemi
const transaction = mongoose.model("Transaction",transactionSchema)

//Veritabanına bağlanma işlemi.
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/test').then(() => console.log("MongoDB User connected"));
    // await mongoose.connect('mongodb://127.0.0.1:27017/').then(() => console.log("MongoDB transaction connected"));

}

//**************************** */

const PORT = process.env.PORT || 5000;

//middleware
app.use(cors({credentials: true , origin: true}))//Buradaki credentials ve origin verileri sayesinde cookies verileri çekilebilmektedir.

app.use(express.json({limit:"50mb"})) //Bu limit değerleri sayesinde verilerin belli bir boyuta kada kabul etmesini sağlar
app.use(express.text({ limit: "200mb" }))
require("dotenv").config()
app.use(cookieParser()) //Cookie işlemleri için gerekli olan middleware

//GET USER LENGTH
//Tüm kullanıcıların sayısını veren ve sayfalama da kullanılan yapı
app.get("/api/data/length",async(req,res)=>{
    try{
        let data = {
            length : 0
        }
        await user.find().then((users) => data.length = users.length )
        res.status(200).json(data)
    }catch(e){
        res.status(404).json(e)
    }
})


//TRANSACTION - GENDER
//Cinsiyet verilerini çekme işlemi 
app.get("/api/data/transaction/gender",async (req,res) => {
    let womanCounder = 0
    let manCounter = 0
    let data = {
        woman:0,
        man:0
    }
    console.log("Cinsiyet sayısını çekmek için istek atıldı");
    //JWT => Token işlemleri için
    try{
        await user.find().then((dataList) => {
            dataList.forEach((item) => {
                if(item.gender === 0){
                    womanCounder ++ 
                }else{
                    manCounter ++
                }
            })
            data.man = manCounter
            data.woman = womanCounder
        }).catch(() => console.log("data get err"))
        res.status(201).json(data)
    }catch(e){
        res.status(404).json(e)
    }
})

//SIGN UP - Middleware
// app.use('/api/data/signUp', (req, res, next) => {
//     const authHeader = req.headers["authorization"]
//     const token = authHeader && authHeader.split(" ")[1]
//     console.log("authHeader::",authHeader);
//     console.log(token)
//     if(!token){
//         return res.status(401).json({
//             succeded : false,
//             error : "No token available"
//         })
//     }
//     next()
// })

//SIGN UP = GİRİŞ YAPMA İŞLEMİ
app.post("/api/data/signUp",async(req,res) => {
    console.log("Giriş için istek atıldı")
    // console.log(process.env.ACCES_TOKEN_SECRET);
    let signInUser = null
    const email = req.body.email
    const password = req.body.password

    await user.find().then((users) => {
        users.forEach((item) => {
            if(item.email === email && item.password === password){
                console.log("Kullanıcı girişi başarılı");
                signInUser = item
                const userToken = Token(item._id) 
                //Buradaki işlem ile token verisini cookie kaydetme işlemi yapıyoruz
                // console.log("Kaydedile token::"+userToken);
                
                res.cookie("jwt",userToken,{
                    httpOnly:true,
                    maxAge: 1000 * 60 * 60 * 24
                })
                
                res.status(201).json({
                    user:item,
                    // token:userToken
                })
            }
        })

        if(signInUser === null ){
            console.log("Kullanıcı bulunamadı");
            res.status(201).json("Kullanici Bulunamadi")    
        }        
    })
})

//Giriş yapan kullanıcıya ait detay sayfası
app.get("/api/data/userDetail",async(req,res) => {
    console.log("Giriş yapan kullanıcıya ait detay sayfası.")
    // const token = req.headers["authorization"].split(" ")[1]
    // console.log("TOKEN COOKİE:::"+req.headers.cookie)
    console.log("TOKEN ::::"+req.cookies.jwt)
    const token = req.cookies.jwt

    if(!token){
        res.status(401).json({
            succeded:false,
            message:"No token "
        })
    }else{
       const userToken = jwt.decode(token,process.env.ACCES_TOKEN_SECRET)
    //    console.log(user);
       try{
        await user.find().where("_id").equals(`${userToken.id}`).exec().then((singleUser) => {
            singleUser.forEach((item) => {
                let bitmap = fs.readFileSync(__dirname+item.image);
                let base64 = Buffer.from(bitmap).toString("base64") 
                //console.log(__dirname+item.image);
                item.image = `data:image/png;base64,${base64}`
                //console.log(item.image);
            } )
            data = singleUser
        })
        res.status(201).json(data)
    }catch(e){
        console.log(e);
        res.status(404).json(e)
    }
       console.log(userToken.id);
       console.log(Date.now());
       
    }
})


//TRANSACTION 
//Değişiklik yapılan kullanıcıları çekme işlemi.
app.get("/api/data/transaction/:q",async (req,res) => {
    let data ;
    console.log("İşlemleri çekmek için istek atıldı");
    let q = req.params.q
    console.log("TRANSACTION Q::"+q);
    if(q !== "All"){
        try{
            await transaction.find().where("transaction").equals(q).sort("-transactionTime").exec().then((dataList) => data = dataList).catch(() => console.log("data get err"))
            res.status(201).json(data)
        }catch(e){
            res.status(404).json(e)
        }
    }else{
        try{
            await transaction.find().sort("-transactionTime").exec().then((dataList) => data = dataList).catch(() => console.log("data get err"))
            res.status(201).json(data)
        }catch(e){
            res.status(404).json(e)
        }

    }
})

//TRANSACTION  
//Kullanıcıların yapmış olduğu son işlemleri kaydetme işlemi.
app.post("/api/data/transaction",(req,res) => {

    console.log("İşlem eklemek için istek atıldı");

    try{
        const newTransaction = new transaction({
            id:req.body.id,
            name:req.body.name,
            surname:req.body.surname,
            email:req.body.email,
            transaction:req.body.transaction,
            transactionTime:Date.now()
        })
        newTransaction.save().then(() => console.log("Saved transaction")).catch((err) => console.log(err))
        res.status(201).json(newTransaction)
    }catch(e){
        res.status(404).json(e)
    }

})

//SEARCH
//DB içerisindeki tüm verilerin çekilmesi işlemi ...
app.get("/api/data/allData/:search" , async(req,res) => {
    let data = []
    //Arama işlemi ile gelen veriyi alır.
    let searchText = req.params.search
    // let searchPage = req.params.page
    //
    console.log("Arama işlemi yapıldı");
    // console.log(searchText);

    try{
        await user.find().then((users) => {
            users.forEach((item) => {
                //Buradaki regex işlemileri ile verinin küçük büyük harf duyarsız olarak arama yapma işlemine olanak sağlar.Metin içersindeki herhangi bir yerdeki karakter dizisi ile benzerlik yakalar.
                if((item.name.search(new RegExp(searchText, "i")) !== -1) || (item.surname.search(new RegExp(searchText, "i")) !== -1) ){
                    let bitmap = fs.readFileSync(__dirname+item.image);
                    let base64 = Buffer.from(bitmap).toString("base64") 
                    
                    item.image = `data:image/png;base64,${base64}`
                    
                    data.push(item)
                }
            } )
            
        })
        res.status(201).json(data)
        
    }catch(e){
        console.log(e);
        res.status(404).json(e)
    }
})

//GET ALL USER
//Kullanıcıları listeleme işlemi...
app.get(`/api/data/:page`,async(req,res)=>{
    //Sayfalama işlemi için her sayfalamada 6 kullanıcı çekilecek.
    try{
        let data 
        //console.log(req.params.page);
        const page = req.params.page
        //Burada resmi tekrar base64 formatına çevirdik ve resmi gösterme işlemi sağlanmış oldu
        //skip fonk başlangıç değerini belirler.
        //limit fonk kaç adet çekileceğini belirler.
        if(page > 0){
            await user.find().skip((page-1)*6).limit(6).then((users) => {
                users.forEach((item) => {
                    let bitmap = fs.readFileSync(__dirname+item.image);
                    let base64 = Buffer.from(bitmap).toString("base64") 
                    //console.log(__dirname+item.image);
                    item.image = `data:image/png;base64,${base64}`
                    //console.log(item.image);
                } )
                data = users
            })
        }
        res.status(200).json(data)
    }catch(e){
        res.status(404).json(e)
    }
});


//POST
//Burada yeni veri ekleme işlemi yapılmaktadır.
app.post('/api/data', async(req, res) => {
    //Buraya işlem başarılı ise response ok şeklinde bir ekleme yapılacak ya da status code üzerinden kontrol yapılacak
    try{
        // req.body.name ile request 'in body sindeki json nesneye erişilir.
        const imageName = uuid.v4()
        //Burada header kısmını kaldırıp base64 yapısındaki resmi png formatına cevirdik.
        let base64Image = req.body.image.split(';base64,').pop();
        
        //File folder change
        const filePath = __dirname + `/public/${imageName}.png`

        //fs.mkdirSync(filePath)
        
        //Burada resmi kaydetme işlemi yapılıyor.
        //__dirname ile son dizine kadar olan yeri gosterir.
        fs.writeFile(filePath , base64Image, {encoding: 'base64'}, function(err) {
            console.log('File created');
        });
        
        const newUser = new user({
            name:req.body.name,
            surname:req.body.surname,
            email:req.body.email,
            password:req.body.password,
            image:`/public/${imageName}.png`,
            phoneNumber:req.body.phoneNumber,
            birthDay:req.body.birthDay,
            gender:req.body.gender,
        })
        newUser.save().then(() => console.log("saved user")).catch((err) => console.log(err))
        
        console.log("eklemek için istek atıldı");
        res.status(201).json(newUser);
    }catch(e){
        res.status(404).json(e)
    }
});

//UPDATE
//Kayıtlı bir kullanıcıyı güncelleme işlemi 
app.post("/api/data/:id",async(req,res) => {
    console.log("Güncelleme için istek atıldı");
    const id = req.params.id;
    try{
        let imageName ;
        await user.find().where("_id").equals(`${id}`).exec().then((singleUser) => {
            imageName = singleUser[0].image
        })

        //*********************** */
        
        //Burada header kısmını kaldırıp base64 yapısındaki resmi png formatına cevirdik.
        let base64Image = req.body.image.split(';base64,').pop();
        
        //File folder change resmin ismi güncelleme işleminde değişiklik yapıldı
        //__dirname ile son dizine kadar olan yeri gosterir.
        const filePath = __dirname + `${imageName}`
        
        //Burada resmi kaydetme işlemi yapılıyor.
        fs.writeFile(filePath , base64Image, {encoding: 'base64'}, function(err) {
            console.log('File created');
        });
        
        //************************/

        let data = {
            name:req.body.name,
            surname:req.body.surname,
            email:req.body.email,
            password:req.body.password,
            phoneNumber:req.body.phoneNumber,
            birthDay:req.body.birthDay,
            gender:req.body.gender,
            image:`${imageName}`,
        }
        //console.log(req.body);
        await user.findByIdAndUpdate({_id:id},data)
        res.status(201).json("succes")
    }catch(e){
        res.status(404).json(e)
    }
})

//DELETE
//kullanıcı silme işlemi
app.delete(`/api/data/:id`,async(req,res) => {
    //Public klasörü içerisinden aynı zamanda resmi de silmemiz gerek.
    console.log("silmek için istek atıldı...");
    try{
        let data ;
        const id = req.params.id;
        //Burada tek elemanlı bir Array dönüyor
        await user.find().where("_id").equals(`${id}`).exec().then((singleUser) => data = singleUser)
        //console.log(data);
        await user.deleteOne({_id:id})
        .then(() => console.log("user deleted"))
        .catch((err) => console.log(err))
        //Kullanıcı silme işlemi yapıldığı için resmi de silme işlemi yapılmaktadır.
        fs.rmSync(__dirname+data[0].image)//Tek elemanlı arrayın 0. elemanı siliniyor

        res.status(201).json(data);
    }catch(e){
        res.status(404).json(e)
    }
})

//SINGLE USER
//ID bilgisi ile bir kullanıcıya ait bilgilerin gelmesini sağlayan yapı.
app.get(`/api/data/user/:id`,async(req,res) => {
    console.log("kullanıcı detay sayfası için veri");
    let data; 
    const userID = req.params.id;
    try{
        await user.find().where("_id").equals(`${userID}`).exec().then((singleUser) => {
            singleUser.forEach((item) => {
                let bitmap = fs.readFileSync(__dirname+item.image);
                let base64 = Buffer.from(bitmap).toString("base64") 
                //console.log(__dirname+item.image);
                item.image = `data:image/png;base64,${base64}`
                //console.log(item.image);
            } )
            data = singleUser
        })
        res.status(201).json(data)
    }catch(e){
        console.log(e);
        res.status(404).json(e)
    }
})

//SEARCH
//Kullanıcılar arasında ismi girilen kişiyi bulma işlemi.
app.get(`/api/data/search/:q`,async(req,res) => {
    let data;
    const searchText = req.params.q
    console.log("arama yapıldı");
    try{
        await user.find().where("name").equals(`${searchText}`).exec().then((users) => {
            users.forEach((item) => {
                let bitmap = fs.readFileSync(__dirname+item.image);
                let base64 = Buffer.from(bitmap).toString("base64") 
                //console.log(__dirname+item.image);
                item.image = `data:image/png;base64,${base64}`
                //console.log(item.image);
            } )
            data = users
        })
        res.status(200).json(data)
    }catch(e){
        res.status(404).json(e)
    }
})

const Token = (userID) => {
    return jwt.sign({id : userID},process.env.ACCES_TOKEN_SECRET,{
        expiresIn: "15m"
    })
}


//Server çalışması
app.listen(PORT, ()=> {
    console.log(`Server runing ${PORT}`)
})