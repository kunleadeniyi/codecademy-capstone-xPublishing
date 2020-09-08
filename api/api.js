const express = require('express');

const apiRouter = express.Router();

// Importing and mounting artistRouter on path '/artists'
const artistRouter = require('./artists');
apiRouter.use('/artists', artistRouter);

// Importing and mounting seriesRouter on path '/series'
const seriesRouter = require('./series');
apiRouter.use('/series', seriesRouter);


module.exports = apiRouter;
