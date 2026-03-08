import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import routes from './routes/index.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = YAML.load(path.resolve(__dirname, './config/swagger.yaml'));


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1', routes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Global Error Handler (Express 5 handles async errors automatically)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 Global Error:', err.message || err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Start Server
const PORT = env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 WARMAY Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
  console.log(`📖 Swagger API Docs: http://localhost:${PORT}/api-docs`);
});
