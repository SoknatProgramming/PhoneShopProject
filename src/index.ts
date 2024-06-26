import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import routes from './routes';
import errorMiddleware from './middleware/error.middleware';
import config from './config';

const PORT = config.port || 3000;

//create instance server
const app: Application = express();

// Middleware to parse incoming request

app.use(express.json());
// HTTP request logger middleware
app.use(morgan('common'));
// HTTPS Security Middleware
app.use(helmet());

//Apply the rate limiting middleware to all request

app.use(
  rateLimit({
    windowMs: 60 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: true, // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: 'Too many request from this IP, Please try again after an hour',
    // store: ... , // Redis, Memcached, etc. See below.
  }),
);

app.use('/api', routes);
//Adding routing for / path
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Hello World',
  });
});

app.use(errorMiddleware);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message:
      'Ohh you are lost, Read the API documentation and find your way back home',
  });
});

app.listen(PORT, () => {
  console.log(`Server is starting on port:${PORT}`);
});

export default app;
