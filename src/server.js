/// imports the dependencies
const express = require('express');
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const path = require("path");
const { v4: uuidv4 } = require('uuid');
require("dotenv").config()

// imports the models
const { Event } = require('./models/event');
const { User } = require('./models/user');

// connects frontend to the server
app.use(express.static(path.resolve(__dirname, "./client/build")));
app.get("*", function (request, response) {
  response.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});


// connects to database
mongoose.connect(process.env.MONGODB_CONNECTION_STRING, 
{ useNewUrlParser: true, useUnifiedTopology: true });

// adds Helmet to enhance  API's security
app.use(helmet());

// uses bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enables CORS for all requests
app.use(cors());

// adds morgan to log HTTP requests
app.use(morgan('combined'));


// authorisation
app.post('/auth', async (req, res) => {
  const user = await User.findOne({userName: req.body.username})
  if (!user) {
    return res.sendStatus(401)
  }
  if (req.body.password !== user.password) {
    return res.sendStatus(403)
  }
  user.token = uuidv4()
  await user.save()
  res.send({token: user.token})
})

app.use(async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const user = await User.findOne({token:authHeader})
  if (user) {
    next()
  } else{
    res.sendStatus(403)
  }
})

// defining CRUD operations
// get all events
app.get('/', async (req, res) => {
  res.send(await Event.find());
});

// get event by location
app.get('/:location', async (req, res) => {
  res.send(await Event.find({location: req.params.location}));
});

// get event by name
app.get('/name/:name', async (req, res) => {
  res.send(await Event.find({name: req.params.name}));
});

// post an event
app.post('/', async (req, res) => {
  const newEvent = req.body;
  const event = new Event(newEvent);
  await event.save();
  res.send({ message: 'New event inserted.' });
});

// delete an event
app.delete('/:id', async (req, res) => {
  await Event.deleteOne({ _id: ObjectId(req.params.id) })
  res.send({ message: 'Event removed.' });
});

// update event
app.put('/:id', async (req, res) => {
  await Event.findOneAndUpdate({ _id: ObjectId(req.params.id)}, req.body )
  res.send({ message: 'Event updated.' });
});

// starts the server
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log("Database connected!")
});