const express = require("express");
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');

const app = express();

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Mount your existing apiRouter below at the '/api' path.
const apiRouter = require('./api/api');
app.use('/api', apiRouter);

app.use(errorHandler());

app.listen(PORT, () => {
    console.log("Server is listening at " + PORT);
});

module.exports = app;