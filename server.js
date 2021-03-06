import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/happyThoughts';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const port = process.env.PORT || 8080;
const app = express();

// Middlewares ------------------------------------
app.use(cors());
app.use(bodyParser.json());

// Models ------------------------------------
const Thought = mongoose.model('Thought', {
  message: {
    type: String,
    required: [true, 'Please enter a message'],
    minlength: [5, 'Oops, message too short! Must be longer than 5 letters.'],
    maxlength: [140, 'Oops, message too long! Maximum length is 140 letters.'],
  },
  hearts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: String,
    default: 'Anonymous',
  },
});

// Routes ------------------------------------
app.get('/', (req, res) => {
  res.json({
    message:
      'Hello all thoughts! View all thoughts at https://happy-thoughts-by-karin.herokuapp.com/thoughts',
  });
});

app.get('/thoughts', async (req, res) => {
  try {
    const allThoughts = await Thought.find()
      .sort({ createdAt: 'desc' })
      .limit(20)
      .exec();
    res.json(allThoughts);
  } catch (err) {
    res
      .status(404)
      .json({ message: 'Could not find any thoughts!', errors: err.errors });
  }
});

app.post('/thoughts', async (req, res) => {
  try {
    const thought = new Thought({
      message: req.body.message,
      author: req.body.author,
    }).save();
    res.json(await thought);
  } catch (err) {
    res.status(400).json({
      message: 'Could not publish your thought!',
      errors: err.errors,
    });
  }
});

app.post('/thoughts/:id/like', async (req, res) => {
  try {
    await Thought.updateOne({ _id: req.params.id }, { $inc: { hearts: 1 } });
    res.status(201).json({ Success: 'Like was successfully added!' });
  } catch (err) {
    res
      .status(404)
      .json({ message: 'Could not find the thought', errors: err.errors });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
