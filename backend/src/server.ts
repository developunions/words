import express from 'express';

const app = express();
const port = 5000; // Бэкенд будет работать на порту 5000 внутри Docker

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Backend API!' });
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});