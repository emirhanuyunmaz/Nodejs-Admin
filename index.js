const express = require('express')
const app = express()
const cors = require("cors")//herhangi bir veri aktarımı öncesinde talebin onaylanıp onaylanmadığının üçüncü taraf sunucularla kontrolünü sağlar
//const mongodb = require("mongodb")//Verileri bir veri tabanında tutmak için kullanılacak
const mongoose = require("mongoose")//Bu sayede hem veritabanı oluşturuyoruz hem de veri ekleme ve çıkartma işlemi yapıyoruz.

const uuid = require("uuid")

const fs = require("fs") 

//***************************** */
main().catch(err => console.log(err));

//Resim ekleme işlemi için yeni bir yer eklenecek
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

//Eklenecek olan elemana ait olan eleman yapısı
const user = mongoose.model("User",userSchema)

//Veritabanına bağlanma işlemi.
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/test').then(() => console.log("MongoDB connected"));
}

//**************************** */


const PORT = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json({limit:"50mb"})) //Bu limit değerleri sayesinde verilerin belli bir boyuta kada kabul etmesini sağlar
app.use(express.text({ limit: "200mb" }))

//try - catch yapılarının eklenmesi

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

//Veri gösterme işlemi
app.get("/api/data/product",(req,res) => {
    console.log("Product sayfasına istek atıldı")
    res.status(201).json("succes")
})

//GET ALL USER 2
//Tüm verileri çekme işlemi.Sayfalama olmadan
app.get("/api/data/allData2",async(req,res) => {

    let data = []

    await user.find().then((users) => {
        users.forEach((item) => {
            let bitmap = fs.readFileSync(__dirname+item.image);
            let base64 = Buffer.from(bitmap).toString("base64") 
            //console.log(__dirname+item.image);
            item.image = `data:image/png;base64,${base64}`
            //console.log(item.image);
        })
        data = users
    })
    res.status(201).json(data)
})



//SEARCH
//Gelen tüm verilere göre bir sayaç belirlenip sayfalama işlemi yapılabilir.
app.get("/api/data/allData/:search" , async(req,res) => {
    let data = []
    //Arama işlemi ile gelen veriyi alır.
    let searchText = req.params.search
    // let searchPage = req.params.page
    //
    console.log("Arama işlemi yapıldı");
    console.log(searchText);

    try{
        
            await user.find().then((users) => {
                users.forEach((item) => {
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
        res.status(201).json("succes");
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

//Server çalışması
app.listen(PORT, ()=> {
    console.log(`Server runing ${PORT}`)
})