import express, { Application, Request, Response } from 'express';

const PORT = 3000;
const app: Application = express();

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Hello World',
  });
});
app.listen(PORT, () => {
  console.log(`Server is starting on port:${PORT}`);
});

export default app;
