import express from 'express';
import { connectDB } from "./config/db";
import { fetchData } from "./service/db_service";
import { addressHandler, sendEtherHandler, helloWorldHandler } from './router/addressRouter';
import { eventListener } from './service/event_servce';
require('dotenv').config()

const app = express();
const port = 3000;

app.use(express.json());

fetchData();

// Define the routes
app.get('/', helloWorldHandler);
app.get('/address/:address', addressHandler);
app.post('/sendEther/:amount', sendEtherHandler);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

connectDB();
eventListener();

export default app;