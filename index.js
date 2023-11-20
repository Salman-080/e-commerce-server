const express = require('express');

const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Shop Server is Running");
})

app.listen(port, (req, res) => {
  console.log(`app is running on port ${port}`);
})

console.log(process.env.DB_USER)
console.log(process.env.DB_PASS)






const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pfweqj8.mongodb.net/?retryWrites=true&w=majority`;
// const uri = "mongodb://localhost:27017";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pfweqj8.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    console.log("connected success")
    const productsCollection = client.db('ProjectDB').collection('ProductsCollections');
    const cartCollection = client.db('ProjectDB').collection('CartsCollections');
    const reviewCollection = client.db('ProjectDB').collection('ReviewsCollections');
    const userCollection = client.db('ProjectDB').collection('UsersCollections');
    // Connect the client to the server	(optional starting in v4.7)

    //storing products to database
    app.post("/products", async (req, res) => {
      const productsInfo = req.body;
      console.log(productsInfo);

      const result = await productsCollection.insertOne(productsInfo);
      res.send(result);

    })

    //getting featured products from products collection
    app.get("/featuredProducts", async (req, res) => {
      const query = { productFeatured: "Yes" };
      const searchResult = productsCollection.find(query);

      const result = await searchResult.toArray();
      res.send(result);
    })

    //getting new Arrival products

    app.get("/newArrivalProducts", async (req, res) => {
      const query = { productNewArrival: "Yes" };
      const searchResult = productsCollection.find(query);

      const result = await searchResult.toArray();
      res.send(result);
    })

    //getting best sells products
    app.get("/bestSellsProducts", async (req, res) => {
      const query = { productBestSelling: "Yes" };
      const searchResult = productsCollection.find(query);

      const result = await searchResult.toArray();
      res.send(result);
    })

    //get all products for shop page
    app.get("/allProducts", async (req, res) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    //individual product fetch by get method

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);

      const query = { _id: new ObjectId(id) };

      const result = await productsCollection.findOne(query);
      res.send(result)
    })

    // product add to cart

    app.post("/cart", async (req, res) => {
      const addingProductToCart = req.body;

      console.log(addingProductToCart);

      const result = await cartCollection.insertOne(addingProductToCart);
      res.send(result);

    })

    app.get("/cart", async (req, res) => {
      const userEmail = req?.query?.email;
      console.log(userEmail);

      const query = { userEmail: userEmail };
      const cursor = cartCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })


    app.delete("/cartDataDelete/:id", async(req,res)=>{
      const cardDataId= req.params.id;
      
      const query={_id: new ObjectId(cardDataId)};

      const result= await cartCollection.deleteOne(query);
      res.send(result);
    })

    //reviews

    app.post("/reviews", async (req, res) => {
      const productReviewsInfo = req.body;
      console.log(productReviewsInfo);

      const result = await reviewCollection.insertOne(productReviewsInfo);
      res.send(result)
    })

    app.get("/reviews/:id", async (req, res) => {
      const productId = req.params.id;
      console.log(productId);
      const query = {
        product_id: productId
      }

      const result = await reviewCollection.find(query).toArray();
      res.send(result)
    })

    //update

    //per product info get by id for default value

    app.get("/update/:id", async (req, res) => {
      const productId = req.params.id;
      console.log(productId);
      const query = { _id: new ObjectId(productId) };

      const result = await productsCollection.findOne(query);
      res.send(result);
    })

    app.put("/updateProduct/:id", async (req, res) => {
      const productId = req.params.id;
      console.log(productId)
      const updatingProduct = req.body;
      console.log(updatingProduct)

      const query = { _id: new ObjectId(productId) };
      const updateDoc = {
        $set: {
          productName: updatingProduct.productName,
          productCategory: updatingProduct.productCategory,
          productImg: updatingProduct.productImg,
          productShortDescription: updatingProduct.productShortDescription,
          productLongDescription: updatingProduct.productLongDescription,
          productType: updatingProduct.productType,
          productFeatured: updatingProduct.productFeatured,
          productBestSelling: updatingProduct.productBestSelling,
          productNewArrival: updatingProduct.productNewArrival

        },
      };

      const result = await productsCollection.updateOne(query, updateDoc);
      res.send(result);
    })


    //delete product from shop

    app.delete("/productDeleteFromShop/:id", async (req, res) => {
      const deletingProductId = req.params.id;
      console.log(deletingProductId);

      const query = { _id: new ObjectId(deletingProductId) };

      const result = await productsCollection.deleteOne(query);
      res.send(result);
    })


    // allUsers info store

    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log(user)
      const result = await userCollection.insertOne(user);
    })

    //get all users

    app.get("/users", async(req,res)=>{
      const result= await userCollection.find().toArray();
      res.send(result);
    })
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

