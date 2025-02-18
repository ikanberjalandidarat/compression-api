// src/index.js
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import routes from './api/routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(compression());
app.use(express.json());

// API routes
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
