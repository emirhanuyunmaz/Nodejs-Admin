const mongoose = require("mongoose")
const User = require("../models/UserModel")
const fs = require("fs")
const uuid = require("uuid")

//*********USER - LENGTH********************/
//Kullanıcı sayısını veren fonk.
const getUsersLength = async(req,res)=>{
    try{
        let data = {
            length : 0
        }
        await User.find().then((users) => data.length = users.length )
        res.status(200).json(data)
    }catch(e){
        res.status(404).json(e)
    }
}

//************DATA-SEARCH*************/
//Kullanıcı içerisinden yazılan karaktere göre arama yapan fonk. 
const allDataSearch = async(req,res) => {
    let data = []
    //Arama işlemi ile gelen veriyi alır.
    let searchText = req.params.search
    // let searchPage = req.params.page
    
    console.log("Arama işlemi yapıldı");
    
    try{
        await User.find().then((users) => {
            users.forEach((item) => {
                //Buradaki regex işlemileri ile verinin küçük büyük harf duyarsız olarak arama yapma işlemine olanak sağlar.Metin içersindeki herhangi bir yerdeki karakter dizisi ile benzerlik yakalar.
                if((item.name.search(new RegExp(searchText, "i")) !== -1) || (item.surname.search(new RegExp(searchText, "i")) !== -1) ){
                    let bitmap = fs.readFileSync(__dirname+"/.."+item.image);
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
}
//***************ALL-DATA*********************/
//Tüm kullanıcıların çekildiği ve sayfalama yapılarak verilerin çekilmesi...
const getAllData = async(req,res)=>{
    //Sayfalama işlemi için her sayfalamada 6 kullanıcı çekilecek.
    console.log("Tüm verileri çekmek için istek atıldı");
    try{
        let data 
        //console.log(req.params.page);
        const page = req.params.page
        // console.log(page);
        //Burada resmi tekrar base64 formatına çevirdik ve resmi gösterme işlemi sağlanmış oldu
        //skip fonk başlangıç değerini belirler.
        //limit fonk kaç adet çekileceğini belirler.
        if(page > 0){
            await User.find().skip((page-1)*6).limit(6).then((users) => {
                // console.log(users);
                users.forEach((item) => {
                    let bitmap = fs.readFileSync(__dirname+"/.."+item.image);
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
}
//**************SINGLE - USER *******************/
//Parametre olarak gelen ID bilgisine göre kullanıcıyı çeken fonk. 
const singleUser = async(req,res) => {
    console.log("kullanıcı detay sayfası için veri");
    let data; 
    const userID = req.params.id;
    try{
        await User.find().where("_id").equals(`${userID}`).exec().then((singleUser) => {
            singleUser.forEach((item) => {
                let bitmap = fs.readFileSync(__dirname+"/.."+item.image);
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
}

//*********** DELETE - USER ********************/
//Parametre olarak gelen ID bilgisine göre kullanıcı silme işlemi.
const deleteUser = async(req,res) => {
    //Public klasörü içerisinden aynı zamanda resmi de silmemiz gerek.
    console.log("silmek için istek atıldı...");
    try{
        let data ;
        const id = req.params.id;
        //Burada tek elemanlı bir Array dönüyor
        await User.find().where("_id").equals(`${id}`).exec().then((singleUser) => data = singleUser)
        
        await User.deleteOne({_id:id})
        .then(() => console.log("user deleted"))
        .catch((err) => console.log(err))
        //Kullanıcı silme işlemi yapıldığı için resmi de silme işlemi yapılmaktadır.
        fs.rmSync(__dirname+"/.."+data[0].image)//Tek elemanlı arrayın 0. elemanı siliniyor

        res.status(201).json(data);
    }catch(e){
        res.status(404).json(e)
    }
}

//****************** UPDATE USER *******************//
//Parametere olarak gelen ID bilgisine göre kullanıcıyı güncelleyen fonk.
const updateUser = async(req,res) => {
    console.log("Güncelleme için istek atıldı");
    const id = req.params.id;
    // console.log("UPDATE:IMAGE",req.body.image);
    //Resim bilgisi yoksa resmi güncelleme işlemi yapılmayacak
    console.log("WEB RESMI",req.body.image.includes("http://"));
    
    
    try{
        if(!req.body.image.includes("http://")){
            console.log("YENI RESIM");
            
            let imageName ;
            await User.find().where("_id").equals(`${id}`).exec().then((singleUser) => {
                imageName = singleUser[0].image
            })
            // await fs.rmSync(__dirname+"/.." + imageName)
            //Burada header kısmını kaldırıp base64 yapısındaki resmi png formatına cevirdik.
            let base64Image = req.body.image.split(';base64,').pop();
            
            //File folder change resmin ismi güncelleme işleminde değişiklik yapıldı
            //__dirname ile son dizine kadar olan yeri gosterir.
            // const filePath = __dirname +"/.."+ `${imageName}`

            const filePath = __dirname + "/.." + `${imageName}`
            // let base64Image = req.body.image.split(';base64,').pop();
            // fs.rmSync(filePath)
        
            //File folder change
            //fs.mkdirSync(filePath)
            
            
            console.log("Dosya yolu",filePath);
            
            //Burada resmi kaydetme işlemi yapılıyor.
            fs.writeFile(filePath , base64Image, {encoding: 'base64'}, function(err) {
                console.log('File created');
            });
            
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
            await User.findByIdAndUpdate({_id:id},data)
        }else{
            console.log("ESKI RESIM");
            
            let data = {
                name:req.body.name,
                surname:req.body.surname,
                email:req.body.email,
                password:req.body.password,
                phoneNumber:req.body.phoneNumber,
                birthDay:req.body.birthDay,
                gender:req.body.gender,
                
            }
            //console.log(req.body);
            await User.findByIdAndUpdate({_id:id},data)
        }
        res.status(201).json("succes")
    }catch(e){
        res.status(404).json(e)
    }
}
//**************ADD - NEW - USER ******************/
//Yeni kullanıcı ekleme işlemi...
const addNewUser = async(req, res) => {
    console.log("yeni kullanıcı için istek");
    //Buraya işlem başarılı ise response ok şeklinde bir ekleme yapılacak ya da status code üzerinden kontrol yapılacak
    try{
        // req.body.name ile request 'in body sindeki json nesneye erişilir.
        const imageName = uuid.v4()
        //Burada header kısmını kaldırıp base64 yapısındaki resmi png formatına cevirdik.
        let base64Image = req.body.image.split(';base64,').pop();
        
        //File folder change
        const filePath = __dirname + "/.." + `/public/${imageName}.png`

        //fs.mkdirSync(filePath)
        
        //Burada resmi kaydetme işlemi yapılıyor.
        //__dirname ile son dizine kadar olan yeri gosterir.
        fs.writeFile(filePath , base64Image, {encoding: 'base64'}, function(err) {
            console.log('File created');
        });
        
        const newUser = new User({
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
}

//***************GET IMAGE********************//
//Kullanıcıya ait resmi bir url ile çekme işlemi...
const getUserImage = async (req,res) => {
    console.log("kullanıcı detay sayfası için resim bilgisi");
    let data; 
    const userID = req.params.id;
    try{
        await User.find().where("_id").equals(`${userID}`).exec().then((singleUser) => {
            singleUser.forEach((item) => {
                let bitmap = fs.readFileSync(__dirname+"/.."+item.image);
                let base64 = Buffer.from(bitmap).toString("base64") 
                //console.log(__dirname+item.image);
                item.image = `data:image/png;base64,${base64}`
                //console.log(item.image);
            } )
            data = singleUser
        })
        // console.log(data[0].image);
        const im = data[0].image.split(",")[1];

        const img = Buffer.from(im, 'base64');

        res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length
        });

        res.end(img); 
        // res.send(data[0].image)
    }catch(e){
        console.log(e);
        res.status(404).json(e)
    }
}

//****************** EMAIL - ORDER *****************/
//Kullanıcı mail adresine göre sıralama işlemi
const orderEmailUser = async (req,res) =>{
    console.log("Kullanıcı email bilgilerine göre sıralama işlemi...");
    
    try{
        let data 
        //console.log(req.params.page);
        const page = req.params.page
        // console.log(page);
        //Burada resmi tekrar base64 formatına çevirdik ve resmi gösterme işlemi sağlanmış oldu
        //skip fonk başlangıç değerini belirler.
        //limit fonk kaç adet çekileceğini belirler.
        if(page > 0){
            await User.find().skip((page-1)*6).limit(6).sort({email:1}).then((users) => {
                // console.log(users);
                users.forEach((item) => {
                    let bitmap = fs.readFileSync(__dirname+"/.."+item.image);
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
    
}

//***************** NAME ORDER ****************/
//Kullanıcı adlarına göre sıralama işlemi . 
const orderNameUser = async (req,res) =>{
    console.log("Kullanıcı isim bilgilerine göre sıralama işlemi...");
    
    try{
        let data 
        //console.log(req.params.page);
        const page = req.params.page
        // console.log(page);
        //Burada resmi tekrar base64 formatına çevirdik ve resmi gösterme işlemi sağlanmış oldu
        //skip fonk başlangıç değerini belirler.
        //limit fonk kaç adet çekileceğini belirler.
        if(page > 0){
            await User.find().skip((page-1)*6).limit(6).sort({name:1,surname:1}).then((users) => {
                // console.log(users);
                users.forEach((item) => {
                    let bitmap = fs.readFileSync(__dirname+"/.."+item.image);
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
    
}

//***************** NAME ORDER ****************/
//Kullanıcı adlarına göre sıralama işlemi . 
const orderPasswordUser = async (req,res) =>{
    console.log("Kullanıcı şifre bilgilerine göre sıralama işlemi...");
    
    try{
        let data 
        //console.log(req.params.page);
        const page = req.params.page
        // console.log(page);
        //Burada resmi tekrar base64 formatına çevirdik ve resmi gösterme işlemi sağlanmış oldu
        //skip fonk başlangıç değerini belirler.
        //limit fonk kaç adet çekileceğini belirler.
        if(page > 0){
            await User.find().skip((page-1)*6).limit(6).sort({password:1}).then((users) => {
                // console.log(users);
                users.forEach((item) => {
                    let bitmap = fs.readFileSync(__dirname+"/.."+item.image);
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
    
}


module.exports = {allDataSearch , getAllData , getUsersLength , singleUser , deleteUser , updateUser , addNewUser , orderEmailUser , orderNameUser , orderPasswordUser , getUserImage}