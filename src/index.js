const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const logger = require("./utils/logger");
const redisClient = require('./services/redisService');

const routeV1 = require('./routes/v1');

const dbConfig = require('../config/mongodb');
const morganMiddleware = require("./middlewares/morganMiddleware");

const app = express();

app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(dbConfig.uri)
  .then(() => logger.info('MongoDB connected'))
  .catch(err => logger.error(err));

app.get('/', (req, res) => {
  res.send('your server is up and running');
});

app.use('/api/v1', routeV1);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
