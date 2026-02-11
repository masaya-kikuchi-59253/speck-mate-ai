const express = require('express');
const cors = require('cors');
const path = require('path');
const checkItemsRouter = require('./routes/checkItems');
const exportRouter = require('./routes/export');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Uploaded files static serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api', checkItemsRouter);
app.use('/api', exportRouter);

app.listen(PORT, () => {
  console.log(`SpecMate AI Backend running on http://localhost:${PORT}`);
});
