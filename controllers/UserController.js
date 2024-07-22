const jwt = require("jsonwebtoken")

const User = require("../models/UserModel")

const fs = require("fs")

//*************USER DETAIL*******************//
//Giriş yapan kullanıcının detay bilgileri.
const userDetail = async(req,res) => {
    console.log("Giriş yapan kullanıcıya ait detay sayfası.")
    const id = req.id
    let data = null

    await User.findOne({_id:id}).then((user) => {
        // console.log(user);
        let bitmap = fs.readFileSync(__dirname+"/.."+user.image);
        let base64 = Buffer.from(bitmap).toString("base64") 
        user.image = `data:image/png;base64,${base64}`
        data = user
    })

    if(data === null){
        console.log("Kullanıcı bulunamadı");
        res.status(402).json({message:"user not found"})
    }else{
        console.log("Kullanıcı bulundu");
        res.status(201).json(data)
    } 
}

//**************SIGN IN**************//
//Kullanıcı Giriş İşlemi 
const userSignIn = async(req,res) => {
    console.log("Giriş için istek atıldı")
    // console.log(process.env.ACCES_TOKEN_SECRET);
    let signInUser = null
    const email = req.body.email
    const password = req.body.password

    await User.find().then((users) => {
        users.forEach((item) => {
            if(item.email === email && item.password === password){
                console.log("Kullanıcı girişi başarılı");
                signInUser = item
                //Token oluşturma işlemleri...
                const userAccessToken = Token(item._id) 
                const userRefreshToken = TokenRefresh(item._id) 
            
                //Token cookie yazılmasın işlemi...
                res.cookie("jwt",userAccessToken,{
                    httpOnly:true,
                    maxAge: 1000 * 60 * 60 * 24
                })

                //Refresh token cookie kaydetme işlemi...
                res.cookie("jwt_refresh",userRefreshToken,{
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
            res.status(402).json({message:"Kullanici Bulunamadi"})    
        }        
    })
}

//******************CREATE - TOKEN*********************//
//Token oluşturma işlemi ve süresinin belirlenmesi
const Token = (userID) => {
    return jwt.sign({id : userID},process.env.ACCES_TOKEN_SECRET,{
        expiresIn: "7d"
    })
}

//***************CREATE - REFRESH - TOKEN********************//
//Refresh token oluştuma işlemi ve süresinin belirlenmesi .
const TokenRefresh = (userID) => {
    return jwt.sign({id : userID},process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: "30d"
    })
}

module.exports = {userDetail , userSignIn}