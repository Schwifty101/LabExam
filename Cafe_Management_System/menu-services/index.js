const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3001;

app.use(express.json());

// MongoDB connection with retry
const connectMongo = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      await mongoose.connect('mongodb://mongo:27017/cafe');
      console.log('Menu Service connected to MongoDB');
      break;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      retries--;
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};
connectMongo().catch(console.error);

// Menu Item Schema
const menuItemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  price: Number,
  stock: Number,
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

// Seed initial data
const seedMenu = async () => {
  try {
    const count = await MenuItem.countDocuments();
    if (count === 0) {
      await MenuItem.insertMany([
        { id: 1, name: 'Espresso', price: 3.5, stock: 100 },
        { id: 2, name: 'Cappuccino', price: 4.0, stock: 100 },
        { id: 3, name: 'Croissant', price: 2.5, stock: 50 },
      ]);
      console.log('Menu seeded');
    }
  } catch (error) {
    console.error('Failed to seed menu:', error);
  }
};
seedMenu();

app.get('/menu', async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

app.get('/menu/:id', async (req, res) => {
  try {
    const item = await MenuItem.findOne({ id: parseInt(req.params.id) });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

app.listen(port, () => {
  console.log(`Menu Service running on port ${port}`);
});

/*
DONE: containerize each microservice and the API gateway using Docker file. Each dockerfile should
define the environment setup confi. This ensures the microservices are portable and can be deployed consistenly accros various environments.

implment CI/CD automation using github actions. Create workflow of files that automatically build docker 
imahes for each service whenever changes are pushed to the main branch. Handle, checking out code,
setting up build env, loggin in to docker, building images and pushing them to the registry.


*/