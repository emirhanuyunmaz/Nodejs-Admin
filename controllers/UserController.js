const jwt = require("jsonwebtoken")
const User = require("../models/UserModel")
const fs = require("fs")


//Giriş yapan kullanıcının detay bilgileri.
const userDetail = async(req,res) => {
    console.log("Giriş yapan kullanıcıya ait detay sayfası.")

    const token = req.cookies.jwt
    const token_refresh = req.cookies.jwt_refresh
    //console.log("REFRESH TOKEN::"+token_refresh);
    //REFRESH TOKEN DECODE 
    if(token_refresh){
        
    }


    if( !token){
        res.status(401).json({
            succeded:false,
            message:"No token "
        })
    }else{
        //const userToken = jwt.decode(token,process.env.ACCES_TOKEN_SECRET)
       
       //Token süresinin bitip bitmediği kontrol edildi.
       //Buradaki işlem token a ait değerleri kontrol eder ve süresinin dolup dolmadığını kontrol eder.
       jwt.verify(token,process.env.ACCES_TOKEN_SECRET,async(err,decodedToken)=>{
        if(err){

            if(token_refresh){
                console.log("Kullanıcı token süresi doldu refresh token ile yeniden güncellendi");
                jwt.verify(token_refresh,process.env.REFRESH_TOKEN_SECRET,async(err,decodeRefreshToken) => {
                    if(err){
                        console.log("Refresh token time out");
                        res.status(401).json(err)
                    }else{
                        const userAccessToken = Token(decodeRefreshToken._id) 
                        res.cookie("jwt",userAccessToken,{
                            httpOnly:true,
                            maxAge: 1000 * 60 * 60 * 24
                        })
                        try{
                            await User.find().where("_id").equals(`${decodeRefreshToken.id}`).exec().then((singleUser) => {
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
                })
            }

            
            
        }else{
            console.log('Decoded token:', decodedToken);
            try{
                await User.find().where("_id").equals(`${decodedToken.id}`).exec().then((singleUser) => {
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
       })    
    }
}

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
                const userAccessToken = Token(item._id) 
                const userRefreshToken = TokenRefresh(item._id) 
                //Buradaki işlem ile token verisini cookie kaydetme işlemi yapıyoruz
                // console.log("Kaydedile token::"+userToken);
                
                res.cookie("jwt",userAccessToken,{
                    httpOnly:true,
                    maxAge: 1000 * 60 * 60 * 24
                })

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
            res.status(201).json("Kullanici Bulunamadi")    
        }        
    })
}

//CREATE - TOKEN
//tokan oluşturma işlemi ve süresinin belirlenmesi
const Token = (userID) => {
    return jwt.sign({id : userID},process.env.ACCES_TOKEN_SECRET,{
        expiresIn: "10s"
        
    })
}

const TokenRefresh = (userID) => {
    return jwt.sign({id : userID},process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: "1d"
    })
}

module.exports = {userDetail , userSignIn}