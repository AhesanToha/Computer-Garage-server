const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const query = require("express/lib/middleware/query");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nikti.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const toolsCollection = client.db("ComputerGarage").collection("tools");
    const userCollection = client.db("ComputerGarage").collection("users");
    const orderCollection = client.db("ComputerGarage").collection("orders");

    app.get("/tools", async (req, res) => {
      const tools = await toolsCollection.find().toArray();
      res.send(tools);
    });

    app.get("/tools/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const tool = await toolsCollection.findOne(query);
      res.send(tool);
    });

    app.put("/tools/:id", async (req, res) => {
      const id = req.params.id;
      const updatedTool = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: updatedTool,
      };
      const result = await toolsCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const user = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send({ success: true, result });
    });
    app.post("/tools", async (req, res) => {
      const newItem = req.body;
      const result = await toolsCollection.insertOne(newItem);
      res.send(result);
    });

    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const orders = await orderCollection.find(query).toArray();
      res.send(orders);
    });
    app.get("/allOrders", async (req, res) => {
      const allOrders = await orderCollection.find().toArray();
      res.send(allOrders);
    });

    app.get("/user", async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    app.put("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Computer is running");
});

app.listen(port, () => {
  console.log("computer is running on", port);
});
