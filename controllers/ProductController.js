const product = require("../models/ProductsModel")
const uuid = require("uuid")
const fs = require("fs")

//******************************ALL DATA************************************//
//Tüm verilerin çekilmesi işlemi...
const getAllData = async(req,res)=>{

    console.log("Tüm veriler çekildi.");
    
    try{
        let data;
        const page = req.params.page
        console.log("Sayfa bilgisi:",page);

        // await product.find().then((pr) => {
        //     data = pr
        // })

        if(page > 0){
            console.log("Sayfalama işlemi geçerli");
            
            await product.find().skip((page-1)*6).limit(6).then((pr) => {
                // console.log("Sayfa sayısına göre ürün çekme işlemi.",pr);
                
                data = pr
            })
        }
        // console.log("DATA::",data);
        
        res.status(201).json(data)
    }catch(e){
        console.log("Tüm ürünleri çekerken bir hata ile karşılaşıldı.");
        res.status(404).json(e)
    }
}

//******************************DATA LENGTH*********************************//
//Ürün sayısını veren yapı . (Sayfalama işlemi için.)
const getAllDataLength = async(req,res) => {
    console.log("Tüm ürünlerin sayısı için istek atıldı.");
    
    let productList = 0

    let pages = req.params.page 
    console.log("Sayfa bilgisi:",pages);

    try{
        await product.find().then((pr) => {
            productList = pr.length
        })
        console.log(productList);
        res.status(201).json({length:productList})
    }catch(e){
        console.log("Tüm ürünler listelenirken bir hata ile karşılaşıldı",e);
        
        res.status(404).json(e)
    }
}

//******************************NEW PRODUCT*********************************//
//Ürün ekleme işlemi
const newProduct = async (req,res) => {
    console.log("yeni ürün için istek");
    // console.log(req.body.images);
    // console.log(req.body.name);
    // console.log(req.body.price);
    // console.log(req.body.amount);
    let imagesNameList = []

    try{
        for(let i = 0 ; i < req.body.images.length ; i++){
            const imageName = uuid.v4()
            let base64Image = req.body.images[i].data_url.split(';base64,').pop();
            const filePath = __dirname + "/.." + `/public/product/${imageName}.png`
            console.log("File Path:",filePath);
            
            fs.writeFile(filePath , base64Image, {encoding: 'base64'}, function(err) {
                console.log('File created');
            });

            let newImage = {
                id:imageName,
                image: `/public/product/${imageName}.png`
            }
            imagesNameList.push(newImage)
        }
        const newProduct =new product({
            name:req.body.name,
            price:req.body.price,
            amount:req.body.amount,
            images:imagesNameList,
            personId:req.body.personId
        })
        newProduct.save().then(() =>console.log("Saved Product")).catch(() => console.log("Error"))
        console.log(imagesNameList);
        res.status(201).json({message:"succes"})
    }catch(e) {
        console.log("Bir hata ile karşılaşıldı::",e);
        
        res.status(404).json(e)
    }
}

//*******************************SINGLE PRODUCT*****************************//
//Bir adet kullanıcı çekme işlemi.
const getSingleProduct = async (req,res) => {
    const id = req.params.id
    console.log(req.params.id);

    try{
        let data ;
        await product.find().where("_id").equals(`${id}`).exec().then((pr) => {
            console.log(pr);
            let imageList =[]
            // http://localhost:5000/api/product/productImage/${i}/${id}
            console.log(pr[0].images);
            
            for(let k = 0 ; k < pr[0].images.length ; k++){
                let s = `http://localhost:5000/api/product/productImage/${pr[0].images[k].id}/${id}`
                imageList.push(s)
            }   
            pr[0].images = imageList
            data = pr
        })
        res.status(201).json(data)

    }catch(e){
        console.log("Bir ürün çekilirken bir hata ile karşılaşıldı...",e);
        res.status(404).json(e)
    }
    
    // res.end()
}

//****************************PRODUCT IMAGE DELETE**************************//
//Bir ürüne ait bir resmin silinmesi işlemi.
const deleteSingleProductImages = async (req,res) => {
    console.log("Ürüne ait resmi silmek için istek atıldı");
    
    //http://localhost:5000/api/product/productImage/0/66d0492017d453740f1ba2ef
    const id = req.params.id
    const number = req.params.number
    console.log(id);
    console.log(number);
    
    let getProduct ;
    //findByIdAndUpdate
    try{
        await product.find().where("_id").equals(id).exec().then((pr) => {
            // console.log(pr[0].images);
            getProduct = pr[0]
            for( let i = 0 ; i<pr[0].images.length ;i++){
                if(number === pr[0].images[i].id){
                    console.log("RESİM BULUNDU:::",pr[0].images[i].image);
                    fs.rmSync(__dirname+"/.."+pr[0].images[i].image)
                }
            }
        })

        let newImages = []
        //Listeden silinirken dosya olarak ta silinmeli...
        for(let i = 0 ; i < getProduct.images.length ; i++ ){
            if(getProduct.images[i].id != number){
                newImages.push(getProduct.images[i])
            }
        }
        await product.findByIdAndUpdate({_id:id},{images:newImages})
        res.status(201).json({message:"succes"})
    }catch(e) {
        console.log("Ürün resmi silme işleminde bir hata ile karşılaşıldı.",e);
        res.status(404).json(e)
    }
}

//***************************DELETE PRODUCT*********************************//
//Bir ürünün tamamen silinmesi işlemi.
const deleteProduct = async(req,res) => {
    const id = req.params.id 
    console.log("Silinecek kullanıcı::",id)

    try{
        await product.find().where("_id").equals(`${id}`).exec().then((pr) => {
            console.log(pr);
            for(let j = 0 ; j < pr[0].images.length ; j++){
                // console.log(pr[0].images[j]);
                //Bu işlem sayesinde veritabanından silinen ürün aynı zamanda dosya olarak ta siliniyor.
                fs.rmSync(__dirname+"/.."+pr[0].images[j].image)
            }
        })

        await product.deleteOne({_id:id})
        res.status(201).json({message:"succes"})
    }catch(e){
        console.log("Ürün silme işleminde bir hata ile karşılaşıldı...",e)
        res.status(404).json(e)
    }
}

//**********************GET PRODUCT IMAGES**********************************//
//Bir ürüne ait resimlerin listesini alma işlemi ...
const getImage = async (req,res) => {
    const id = req.params.id
    const number = req.params.number
    console.log("Resim numarası:",number);
    
    console.log("Ürün resmi:",id)
    let imagesList = []

    try{
        await product.find().where("_id").equals(id).exec().then((pr) => {
            console.log(pr[0].images);
            // console.log("Resmin yolu",pr[0].images[0].split("/")[3].split(".")[0]);
            // let bitmap = fs.readFileSync(__dirname+"/.."+item.image);
            for (let i = 0 ; i<pr[0].images.length ; i++){
                 
                //console.log(__dirname+item.image);
                console.log("REsim bilgisi",pr[0].images[i].id)
                console.log("GELEN ID :",number);
                
                if(pr[0].images[i].id === number){
                    console.log("RES:",pr[0].images[i].image);
                    
                    let bitmap = fs.readFileSync(__dirname+"/.."+pr[0].images[i].image);
                    let base64 = Buffer.from(bitmap).toString("base64")
                    imagesList.push(`data:image/png;base64,${base64}`)
                    console.log("SSSSS::",imagesList);
                    
                }
                //console.log(item.image);
            
            }
        })
        
        const im = imagesList[0].split(",")[1];

        const img = Buffer.from(im, 'base64');

        res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length
        });

        res.end(img);
       

    }catch(e){
        console.log("Ürün resimi çekme işlemi bir hata",e);
        res.status(404).json(e)
    }
    res.end()
}

//**************************SEARCH PRODUCT**********************************//
//Bir ürünün adına göre aranması işlemi.
const searchProductName = async (req,res) => {
    // Ürün ismine göre arama işlemi ...
    let data = []
    //Arama işlemi ile gelen veriyi alır.
    let searchText = req.params.productName
    // let searchPage = req.params.page
    
    console.log("Ürün Arama işlemi yapıldı");
    console.log(searchText);
    
    try{
        await product.find().then((pr) => {
            pr.forEach((item) => {
                //Buradaki regex işlemileri ile verinin küçük büyük harf duyarsız olarak arama yapma işlemine olanak sağlar.Metin içersindeki herhangi bir yerdeki karakter dizisi ile benzerlik yakalar.
                if((item.name.search(new RegExp(searchText, "i")) !== -1)){
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

//****************************UPDATE PRODUCT********************************//
//Ürün güncelleme işlemi .
const updateProduct = async(req,res) => {
    const productID = req.params.id
    console.log(productID);
    console.log("Ürün güncelleme isteği");
    
    //Ürün id si ile verilerin güncellemesi işlemi.

    const name = req.body.name
    const price = req.body.price
    const amount = req.body.amount
    const personId = req.body.personId

    // console.log("Name:",name)
    // console.log("Price:",price)
    // console.log("Amount:",amount);
    // console.log("PersonId:",personId);
    
    try{

        let data = {
            name:name,
            price:price,
            amount:amount,
            personId:personId
        }
        await product.findByIdAndUpdate({_id:productID},data)
        res.status(201).json(data)

    }catch(e){
        console.log("Ürün güncellerken bir hata ile karşılaşıldı .",e);
        
        res.status(404).json(e)
    }
}


module.exports = { newProduct , getAllData , getSingleProduct , getImage , deleteSingleProductImages ,deleteProduct , getAllDataLength , searchProductName , updateProduct}