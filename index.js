const jwt = require("jsonwebtoken")
require('dotenv').config()
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()


app.use(cors())
app.use(express.json())


const port = process.env.PORT || 5000

app.get('/', (req, res) => {
  res.send('essuin running is a express')
})

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).send({ massage: 'Unauthorized user' })
  }
  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {

    if (error) {
      return res.status(401).send({ massage: 'Unauthorized user' })
    }
    req.decoded = decoded
  })
  next()
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uadalh8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    const serviceCollection = client.db('essuin').collection('service')
    const reviewCollection = client.db('essuin').collection('reviews')

    // get single service by id 

    app.get('/service/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const service = await serviceCollection.findOne(query)
      res.send(service)
    })
    // jwt 
    app.post('/jwt', (req, res) => {
      const user = req.body
      console.log(user)
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '23hr' })
      res.send({ token })

    })
    // get all services
    app.get('/all-services', async (req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query)
      const courses = await cursor.toArray()
      res.send(courses)
    })
    // get limited services
    app.get('/services', async (req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query)
      const courses = await cursor.limit(3).toArray()
      res.send(courses)
    })


    app.get('/reviews-email', async (req, res) => {
      // find out email 
      let query = {}
      if (req.query.email) {
        query = {
          email: req.query.email
        }
      }
      const cursor = reviewCollection.find(query)
      const review = await cursor.toArray()
      res.send(review)
    })


    // get reviews filter by service id
    app.get('/reviews', async (req, res) => {
      let query = {}
      if (req.query.service_ID) {
        query = {
          service_ID: req.query.service_ID
        }
      }
      const cursor = reviewCollection.find(query)
      const review = await cursor.toArray()
      res.send(review)
    })


    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review)
      res.send(result)
    })

    // delete api
    app.delete('/reviews/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const reviews = await reviewCollection.deleteOne(query)
      res.send(reviews)
    })


    app.patch('/reviews/:id', async (req, res) => {
      const id = req.params.id
      const massage = req.body.massage
      const review = req.body.review
      const query = {_id : ObjectId(id)} 
      const updated = {$set : {massage, review }}
      const result = await reviewCollection.updateMany(query, updated)
      res.send(result) 
  })


    app.post('/services', async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service)
      res.send(result)
    })
  }
  finally { }

}


run().catch(error => console.error(error))


app.listen(port, () => {
  console.log('server is ', port)
})
