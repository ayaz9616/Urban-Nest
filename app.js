const express=require("express");
const app=express();
const mongoose=require("mongoose");
const URL="mongodb://127.0.0.1:27017/wanderlust";
const Listing=require("./models/listing");
const path=require("path");
const sampleListings=require("./init/data.js");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const { wrap } = require("module");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");


async function main()
{
    await mongoose.connect(URL)
}
main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
})

app.set("view engine","ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


app.get("/",(req,res)=>{
    res.render("listings/home.ejs")
})

const validateListing=(req,res,next)=>{
    let{error}=listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,result.error);
    }
    else{
        next();
    }
}

app.get("/listings",async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings})
});

app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs")
} )

app.get("/listings/:id",async (req,res)=>{
    let{id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
})

// app.post("/listings",async (req,res)=>{
//     try{
//         let {title,description,image,price,country,location}=req.body;
//         const newListing = new Listing({
            
//             title: title,
//             description: description,
//             image: image,
//             price: price,
//             country: country,
//             location: location
//           });
//         await newListing.save();
//     } 
//     catch(err){
//         console.log(err)
//     }

// })

app.post("/listings",validateListing, async (req, res) => {
    try {
       let result= listingSchema.validate(req.body);
       console.log(result);
      const { title, description, image, price, country, location } = req.body;
      const newListing = new Listing({
        title,
        description,
        image,
        price,
        country,
        location
      });
      await newListing.save();
      res.redirect(`/listings/${newListing._id}`);  // Redirect to the newly created listing
    } catch (err) {
      console.error("Error creating listing:", err);
      res.status(500).send("Server error");
    }
  });
  

// app.post("/listings",wrapAsync(async (req,res,next)=>{
//     const newListing=new Listing(req.body.listing);
//     newListing.save();
//     res.redirect("/listings")
// }))

// app.get("/testListing",async (req,res)=>{
//     for(const element of sampleListings) {
//         let listing=new Listing({
//             title:element.title,
//             description:element.description,
//             price:element.price,
//             location:element.location,
//             country:element.country
//         });
//         await listing.save();
//     }; 
   

    
//     console.log("sample was saved");
//     res.send("successful testing");
// });



app.get("/testListing", async (req, res) => {
    try {
        for (const element of sampleListings) {
            const listing = new Listing({
                title: element.title,
                description: element.description,
                price: element.price,
                location: element.location,
                country: element.country,
                image: element.image 
            });
            await listing.save();
        }
        console.log("Sample listings were saved.");
        res.send("Successful testing");
    } catch (error) {
        console.error("Error saving sample listings:", error);
        res.status(500).send("Error saving sample listings");
    }
});

app.get("/listings/:id/edit",async (req,res)=>{
   
    try{
        let{id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing})
    } catch(err){
        console.log(err)
    }
})

app.put("/listing/:id",wrapAsync(async(req,res)=>{
    let{id}=req.params;
    await Listing.findByIdAndUpdate(id,req.body);
    res.redirect(`/listings/${id}`)
}))

// app.delete("/listings/<%= listing._id %>/delete",async (req,res)=>{
//     try{
//         let { id } = req.params;
//         const deletedListing = await Listing.findByIdAndDelete(id);
//         res.render("listings/index.ejs")
//     }
//     catch(err){
//         console.log(err);
//     }
// })

app.delete("/listing/:id", async (req, res) => {
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings")
});

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found !!"));
})
app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something went wrong !!"}=err;
    res.status(statusCode).render("error.ejs",{err})
})


app.listen(8080,()=>{
    console.log("server started at 8080");
});


