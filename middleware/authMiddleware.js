const jwt = require("jsonwebtoken")

const authMiddleware = async(req,res,next) =>{
    const token = req.cookies.jwt
    const token_refresh = req.cookies.jwt_refresh
         
    if(!token){
        res.status(401).json({
            succeded:false,
            message:"No token"
        })
    }else{       
       //Token süresinin bitip bitmediği kontrol edildi.
       //Buradaki işlem token a ait değerleri kontrol eder ve süresinin dolup dolmadığını kontrol eder.
       jwt.verify(token,process.env.ACCES_TOKEN_SECRET,async(err,decodedToken)=>{
        if(err){
            //Token süresi dolmuş ...
            //Refresh token a bakılacak...
            if(token_refresh){
                jwt.verify(token_refresh,process.env.REFRESH_TOKEN_SECRET , async(err,refreshTokenDecode) => {
                    if(err){
                        //Refresh token süresi de dolmuş...
                        console.log("Refresh token time out");
                        res.status(401).json(err)
                    }else{
                        //Refresh token ile token güncellendi
                        console.log("Token süresi dolmuş ama refresh token ile güncelleme işlemi yapılmıştır.");
                        const userAccessToken = Token(refreshTokenDecode.id)
                        console.log("REfresh token id::" +refreshTokenDecode.id);
                        res.cookie("jwt",userAccessToken,{
                            httpOnly:true,
                            maxAge: 1000 * 60 * 60 * 24
                        })
                        req.id = refreshTokenDecode.id
                        next()
                    }
                })
            }else{
                //Refresh token süresi de dolmuş...
                console.log("Refresh not found.");
                res.status(401).json(err)
            }

        }else{
            console.log("Token geçerli.");
            req.id = decodedToken.id
            next()
        }
    }
    )   
    }
    
}

const Token = (userID) => {
    return jwt.sign({id : userID},process.env.ACCES_TOKEN_SECRET,{
        expiresIn: "10s"
    })
}

module.exports ={
    authMiddleware
}