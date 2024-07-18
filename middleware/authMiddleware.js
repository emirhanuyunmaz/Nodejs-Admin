
const authenticateToken = (req,res,next) => {
    const authHeader = req.headers["authorization"]
    console.log("authHeader::",authHeader);
}

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


module.exports = authenticateToken