// src/app.ts
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { sequelize } from './db';
import { loggerMiddleware } from './middlleware/logger';
import trainRoutes from './handlers/train';
import refreshScoreRoutes from './handlers/refreshScore';
import healthRoutes from './handlers/health';

const app = express();
const PORT = 3000;

// Enable CORS for all routes
// app.use(cors());
app.use(cors({
  origin: '*', // or your specific frontend domain
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));



// Parse JSON request bodies
app.use(bodyParser.json());


// Routes
app.use('/train',loggerMiddleware ,trainRoutes);   
app.use('/refresh-score',loggerMiddleware, refreshScoreRoutes);   
app.use('/health', healthRoutes);

// Start DB and server
sequelize.authenticate().then(() => {
  console.log('✅ DB connected');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ DB connection failed:', err);
});
