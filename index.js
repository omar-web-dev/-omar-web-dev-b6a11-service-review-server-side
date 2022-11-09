require('dotenv').config()
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()


app.use(cors())
app.use(express.json())


const port = process.env.PORT || 5000

app.get('/', (req, res) => {
  res.send('essuin running is a express')
})





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uadalh8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    const serviceCollection = client.db('essuin').collection('service')

    app.get('/all-services', async (req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query)
      const courses = await cursor.toArray()
      res.send( courses)
    })

    app.get('/services', async (req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query)
      const courses = await cursor.limit(3).toArray()
      res.send( courses)
    })
  }
  finally { }

}


run().catch(error => console.error(error))


app.listen(port, () => {
  console.log('server is ', port)
})
