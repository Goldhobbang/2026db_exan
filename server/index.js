import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRouter from './routes/users.js';
import clubsRouter from './routes/clubs.js';
import applicationsRouter from './routes/applications.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Club Recruit Backend is running...');
});

app.use('/api/users', usersRouter);
app.use('/api/clubs', clubsRouter);
app.use('/api/applications', applicationsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
