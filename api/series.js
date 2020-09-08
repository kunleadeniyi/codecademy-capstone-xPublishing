const express = require('express');
const seriesRouter = express.Router();

module.exports = seriesRouter;

// importing sqlite and assessing the database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

seriesRouter.param('seriesId', function(req, res, next, seriesId) {
    const sql = `SELECT * FROM Series WHERE id = $id`;
    const value = {$id: seriesId};
    db.get(sql, value, function(err, series) {
        if (err) {
            next(err);
        } else if (series) {
            req.series = series;
            next()
        } else {
            res.sendStatus(404);
        }
    })
});

seriesRouter.get('/', function(req, res, next) {
    db.all('SELECT * FROM Series', function(err, row) {
        if (err) {
            next(err);
        } else {
            res.status(200).json({series: row});
        }
    })
});

seriesRouter.get('/:seriesId', function(req, res, next) {
    res.status(200).json({series: req.series});
})

// artistRouter.get('/:artistId', function(req,res,next) {
//     res.status(200).json({artist: req.artist})
//     // console.log(req.artist);
// });

seriesRouter.post('/', function(req, res, next) {
    const newSeries = req.body.series;
    if (!newSeries.name || !newSeries.description) {
        res.sendStatus(400);
    } else {
        const sql = `INSERT INTO Series (name, description)
        VALUES ($name, $description)`;
        const values = {$name: newSeries.name, 
            $description: newSeries.description
        }
        db.run(sql, values, function(err) {
            if (err) {
                next(err);
            };
            db.get(`SELECT * FROM Series WHERE id = $id`, {$id: this.lastID}, function(err, series) {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({series: series});
                }
            })
        })
    }
});

seriesRouter.put('/:seriesId', function(req,res,next) {
    const updatedSeries = req.body.series;
    if (!updatedSeries.name || !updatedSeries.description) {
        res.sendStatus(400);
    } else {
        const sql = `UPDATE Series 
        SET name = $name, 
            description = $description 
        WHERE Series.id = $seriesId`;
        const values = {
            $name: updatedSeries.name,
            $description: updatedSeries.description,
            $seriesId: req.params.seriesId
        };
        db.run(sql, values, function(err) {
            if (err) {
                next(err)
            };
            db.get(`SELECT * FROM Series WHERE id = $id`, {$id: req.params.seriesId}, function(err, series) {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({series: series});
                }
            })
        })
    }
})


// Importing and mounting issuesRouter on path '/:seriesId/issues'
const issuesRouter = require('./issues');
seriesRouter.use('/:seriesId/issues', issuesRouter);

seriesRouter.delete('/:seriesId', (req, res, next) => {
    // check if there are existing issues attached to the series
    let issueSql = `SELECT * FROM Issue WHERE series_id = $seriesId`;
    let issueValue = {$seriesId: req.params.seriesId};
    db.get(issueSql, issueValue, (err, issue) => {
        if (err) {
            next(err);
        } else if (issue) {
            console.log("It has issues!");
            res.sendStatus(400);
        } else {
            let deleteSql = `DELETE FROM Series WHERE id = $seriesId`;
            let deleteValue = {$seriesId: req.params.seriesId};
            db.run(deleteSql, deleteValue, (err) => {
                if (err) {
                    next(err);
                } else {
                    res.sendStatus(204)
                }
            })
        }
    });
})