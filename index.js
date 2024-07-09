const express = require('express')
const app = express()
const cors = require("cors")//herhangi bir veri aktarımı öncesinde talebin onaylanıp onaylanmadığının üçüncü taraf sunucularla kontrolünü sağlar


const PORT = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors())


let data = []

//Kullanıcıları listeleme işlemi...
app.get(`/api/data`,(req,res)=>{
    res.status(200).json(data)
});

//Burada yeni veri ekleme işlemi yapılmaktadır.
app.post('/api/data', (req, res) => {
    // req.body.name ile request 'in body sindeki json nesneye erişilir.
    const newItem = {
        id : data.length + 1,
        name : req.body.name,
        email : req.body.email,
        password : req.body.password
    };
    console.log("eklemek için istek atıldı");
    data.push(newItem);
    res.status(201).json(newItem);
});

//kullanıcı silme işlemi
app.delete(`/api/data/:id`,(req,res) => {
    console.log("silmek için istek atıldı...");
    const id = req.params.id;
    const newList = data.filter((user) => {
        return user.id !== id;
    })
    data = newList
})

app.listen(PORT, ()=> {
    console.log(`Server runing ${PORT}`)
})