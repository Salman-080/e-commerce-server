const express = require('express');
// const jwt=require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pfweqj8.mongodb.net/?retryWrites=true&w=majority`;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pcelgh9.mongodb.net/?retryWrites=true&w=majority`;


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
    const categoryCollection = client.db('ProjectDB').collection('CategoryCollections');
    const productsCollection = client.db('ProjectDB').collection('ProductsCollections');
    const cartCollection = client.db('ProjectDB').collection('CartsCollections');
    const reviewCollection = client.db('ProjectDB').collection('ReviewsCollections');
    const userCollection = client.db('ProjectDB').collection('UsersCollections');
    const orderCollection = client.db('ProjectDB').collection('OrdersCollection');

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
      const categoryName = req.query.categoryName;
      console.log(categoryName)
      if (categoryName && categoryName !== "All") {
        const query2 = {
          productCategory: categoryName
        }
        const cursor = productsCollection.find(query2);
        const result = await cursor.toArray();
        res.send(result);

        return;
      }
      const cursor = productsCollection.find();
      const result = await cursor.toArray();

      res.send(result);
    })

    //get all products for shop page by category Name
    app.get("/filterByCategory/:categoryName", async (req, res) => {
      const categoryName = req.params.categoryName;
      const query = { productCategory: categoryName };
      console.log("category", categoryName)

      if (categoryName && categoryName == "All") {
        const cursor = productsCollection.find();
        const result = await cursor.toArray();
        res.send(result)
      }
      else {
        const cursor = productsCollection.find(query);
        const result = await cursor.toArray();


        res.send(result)
      }


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


    app.delete("/cartDataDelete/:id", async (req, res) => {
      const cardDataId = req.params.id;

      const query = { _id: new ObjectId(cardDataId) };

      const result = await cartCollection.deleteOne(query);
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
      console.log("new user", user)
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    //get all users

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })


    //add categories

    app.post("/addCategories", async (req, res) => {
      const categoryData = req.body;

      const result = await categoryCollection.insertOne(categoryData);

      res.send(result);
    })

    app.get("/categoriesData", async (req, res) => {
      const result = await categoryCollection.find().toArray();

      res.send(result);
    })

    // search products get

    app.get('/searchProducts', async (req, res) => {
      const searchValue = req.query.searching;
      console.log("searching", searchValue);

      if (searchValue && searchValue.length !== 0) {
        const query = {
          productName: { $regex: searchValue, $options: 'i' }
        }
        const result = await productsCollection.find(query).toArray();
        res.send(result);
      }
      else {
        const result = await productsCollection.find().toArray();
        res.send(result)
      }

    })

    //filter by targeter

    // app.get("/targeterFilter/:targeter", async(req,res)=>{
    //   const targeter= req.params.targeter;
    //   console.log(targeter);

    //   const query={productTargeter: targeter};

    //   const result= await productsCollection.find(query).toArray();
    //   res.send(result);
    // })

    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });

    });

    app.post("/payment", async (req, res) => {
      const orderInfo = req.body;
      console.log(orderInfo);

      orderInfo.orderDateTime = new Date();

      const paymentInsResult = await orderCollection.insertOne(orderInfo);

      const productDetailsDec = orderInfo?.itemsInfo?.map(item => (
        {
          productId: item?.productId,
          productSltQnt: item?.productSltQnt
        }
      ));

      console.log("product Decrementing", productDetailsDec)


      const query = {
        _id: {
          $in: orderInfo.cartIds.map(cartId => new ObjectId(cartId))
        }
      }

      const deleteFromCartResult = await cartCollection.deleteMany(query);



      const productQntyDec = productDetailsDec.map(({ productId, productSltQnt }) => ({
        updateOne: {
          filter: { _id: new ObjectId(productId) },
          update: { $inc: { productQuantity: -productSltQnt } }
        }
      }));

      // Perform bulk update using updateMany
      const decmentResult = await productsCollection.bulkWrite(productQntyDec);

      const productQntyDecCart = productDetailsDec.map(({ productId, productSltQnt }) => ({
        updateOne: {
          filter: { product_id: productId },
          update: { $inc: { productQuantity: -productSltQnt } }
        }
      }));
      const decmentResultCart = await cartCollection.bulkWrite(productQntyDecCart);

      const query2 = {
        productQuantity: { $lte: 0 }
      }


      const removeItemFromCart = await cartCollection.deleteMany(query2);
      res.send({ paymentInsResult, deleteFromCartResult, decmentResult, decmentResultCart, removeItemFromCart });
    })

    //managePendings route for admin

    app.get("/managePendingsData", async (req, res) => {
      const query = {
        $or: [
          { paymentStatus: "Pending" },
          { deliveryStatus: "Pending" }
        ]
      }
      const result = await orderCollection.find(query).toArray();

      res.send(result);
    })

    //approving payment status by admin

    app.patch("/approvePaymentStatus/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);

      const query = {
        _id: new ObjectId(id)
      }
      const updateDoc = {
        $set: {
          paymentStatus: "Success"
        },
      };

      const result = await orderCollection.updateOne(query, updateDoc);
      res.send(result);
    })

    //approving delivery status by admin
    app.patch("/approveDeliveryStatus/:id", async (req, res) => {
      const id = req.params.id;
      const productsIdSldQny = req?.body?.productsIdSldQny;
      console.log(productsIdSldQny)
      console.log(id);

      const query = {
        _id: new ObjectId(id)
      }
      const updateDoc = {
        $set: {
          deliveryStatus: "Success"
        },
      };

      const result = await orderCollection.updateOne(query, updateDoc);
      res.send(result);
    })

    // add as admin

    app.patch("/addAsAdmin/:userId", async (req, res) => {
      const id = req.params.userId;
      console.log(id);

      const query = {
        _id: new ObjectId(id)
      }

      const updateDoc = {
        $set: {
          role: "Admin"
        },
      };

      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    })

    // remove from admin 
    app.patch("/removeFromAdmin/:userId", async (req, res) => {
      const id = req.params.userId;
      console.log(id);

      const query = {
        _id: new ObjectId(id)
      }

      const updateDoc = {
        $unset: {
          role: 1
        },
      };

      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    })

    //displaying all products in Admin side

    app.get("/dashboardAllProducts", async (req, res) => {
      const result = await productsCollection.find().toArray();

      res.send(result);
    })

    // admin home stats

    app.get("/adminHomeStats", async (req, res) => {
      const customers = await userCollection.estimatedDocumentCount()
      const products = await productsCollection.aggregate([
        {
          $group: {
            _id: null,
            quantity: { $sum: "$productQuantity" },
          },

        },
        {
          $project: {
            _id: 0,
            quantity: 1
          }
        }
      ]).toArray();
      const totalQuantity = products.length > 0 ? products[0].quantity : 0;

      const orders = await orderCollection.estimatedDocumentCount()

      const query = {
        paymentStatus: "Success"
      }
      const payments = await orderCollection.find(query).toArray()
      console.log(payments)
      const revenue = payments.reduce((total, payment) => total + payment?.totalPrice, 0);


      res.send({ revenue, customers, products: totalQuantity, orders });

    })

    // admin home each category total product counts
    app.get("/orderStats", async (req, res) => {

      const result = await orderCollection.aggregate([
        {
          $match: { paymentStatus: "Success" }
        },
        {
          $unwind: "$itemsInfo"
        },
        {
          $group: {
            _id: "$itemsInfo.productCategory",
            totalQuantity: { $sum: "$itemsInfo.productSltQnt" },
            totalRevenue: {
              $sum: {
                $multiply: ["$itemsInfo.productPrice", "$itemsInfo.productSltQnt"]
              }
            }
          }
        },
        {
          $project: {
            categoryName: "$_id",
            totalQuantity: 1,
            totalRevenue: 1,
            _id: 0
          }
        }

      ]).toArray();

      res.send(result);
    })

    // customer get their order history

    app.get("/usersOrder/:email", async (req, res) => {
      const email = req.params.email;

      const query = { customerEmail: email };

      const result = await orderCollection.find(query).toArray();

      res.send(result);
    })

    //payment history admin side count stat

    app.get("/paymentStats", async (req, res) => {


      const result = await orderCollection.aggregate([
        {
          $facet: {
            Success: [
              { $match: { paymentStatus: "Success" } },
              { $group: { _id: null, count: { $sum: 1 } } },
              { $project: { _id: 0, count: 1 } },
            ],
            Pending: [
              { $match: { paymentStatus: "Pending" } },
              { $group: { _id: null, count: { $sum: 1 } } },
              { $project: { _id: 0, count: 1 } },
            ],
          },
        },
        {
          $project: {
            _id: 0,
            Success: { $arrayElemAt: ["$Success.count", 0] },
            Pending: { $arrayElemAt: ["$Pending.count", 0] },
          },
        },
      ]).toArray();

      res.send(result)
    })

    // admin side order history stats

    app.get("/getOrderInfoStat", async(req,res)=>{
      const deliveryStatus= await orderCollection.aggregate([
        {
          $facet: {
            Success: [
              { $match: { deliveryStatus: "Success" } },
              { $group: { _id: null, count: { $sum: 1 } } },
              { $project: { _id: 0, count: 1 } },
            ],
            Pending: [
              { $match: { deliveryStatus: "Pending" } },
              { $group: { _id: null, count: { $sum: 1 } } },
              { $project: { _id: 0, count: 1 } },
            ],
          },
        },
        {
          $project: {
            _id: 0,
            Success: {
              $ifNull: [{ $arrayElemAt: ["$Success.count", 0] }, 0]
            },
            Pending: {
              $ifNull: [{ $arrayElemAt: ["$Pending.count", 0] }, 0]
            },
            // Success: { $arrayElemAt: ["$Success.count", 0] },
            // Pending: { $arrayElemAt: ["$Pending.count", 0] },
          },
        },
      ]).toArray();

      const totalOrders= await orderCollection.estimatedDocumentCount();

      res.send({deliveryStatus, totalOrders});
    })

    // current user
    app.get("/currentUserInfo/:email", async(req,res)=>{
      const email=req.params.email;

      const query={userEmail: email};

      const result= await userCollection.findOne(query);
      res.send(result);
    })

    // admin check

    app.get("/currentUserAdmin/:email", async(req,res)=>{
      const email= req.params.email;

      const query={userEmail: email};

      let isAdmin=false;

      const exist= await userCollection.findOne(query);

      if(exist){
        isAdmin=exist?.role=="Admin"
      }

      res.send({isAdmin});
    })
    

    //profile update

    app.patch("/upDatingMyProfileData/:email",async(req,res)=>{
      const profileData = req.body;
      const email= req.params.email;

      console.log(profileData);
      const query={
        userEmail: email
      }

      const updateDoc={
        $set: {
          userName: profileData.name
        }
      }
      const result= await userCollection.updateOne(query, updateDoc);
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


