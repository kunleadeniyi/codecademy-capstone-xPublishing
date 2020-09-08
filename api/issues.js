const issuesRouter = require('express').Router({mergeParams: true});

// importing sqlite and assessing the database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports = issuesRouter;

issuesRouter.param('issueId', function(req,res,next,issueId) {
    const sql = 'SELECT * FROM Issue WHERE id = $id';
    const value = {$id: issueId};
    db.get(sql, value, function(err, issue) {
        if (err) {
            next(err);
        } else if(issue) {
            req.issue = issue;
            next()
        } else {
            res.sendStatus(404);
        }
    })
})

issuesRouter.get('/', function(req,res,next) {
    const sql = "SELECT * FROM Issue WHERE series_id = $seriesId";
    const value = {$seriesId: Number(req.params.seriesId)};
    
    db.all(sql, value, function(err, issues) {
        if (err) {
            next(err);
        } else if (!issues) {
            res.status(200).json({issues: []})
        } else {
            res.status(200).json({issues: issues});
        }
    })
});

issuesRouter.post('/', function(req,res,next) {
    const newIssue = req.body.issue;
    if (!newIssue.name || !newIssue.issueNumber || !newIssue.publicationDate || !newIssue.artistId) {
        res.sendStatus(400)
    } /* Check if artist with artistId exists */ else {
        const sql = `SELECT * FROM Artist WHERE Artist.id = $id`;
        const value = {$id: newIssue.artistId};
        db.get(sql, value, function(err, artist) {
            if (err) {
                next(err);
            } else if (artist) {
                // add issue to database 
                const sql = `
                INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id)
                VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)
                `;
                const values = {
                    $name: newIssue.name,
                    $issueNumber: newIssue.issueNumber,
                    $publicationDate: newIssue.publicationDate,
                    $artistId: newIssue.artistId,
                    $seriesId: req.params.seriesId
                };
                db.run(sql, values, function(err) {
                    if (err) {
                        next(err);
                    } else {
                        db.get("SELECT * FROM Issue WHERE id = $id", {$id: this.lastID}, function(err, issue) {
                            if (err) {
                                next(err);
                            } else {
                                res.status(201).json({issue: issue});
                            }
                        })
                    }
                })
            } else {
                res.sendStatus(400)
            }
        })
    }
});

issuesRouter.put('/:issueId', function(req,res,next) {
    const updatedIssue = req.body.issue;
    if (!updatedIssue.name || !updatedIssue.issueNumber || !updatedIssue.publicationDate || !updatedIssue.artistId) {
        res.sendStatus(400)
    } else {
        const sql = `SELECT * FROM Artist WHERE Artist.id = $id`;
        const value = {$id: updatedIssue.artistId};
        db.get(sql, value, function(err, artist) {
            if (err) {
                console.log('error from checking if artist is valid');
                next(err);
            } else if (artist) {
                // add issue to database 
                const sql = `
                UPDATE Issue 
                SET name = $name, 
                    issue_number = $issueNumber, 
                    publication_date = $publicationDate, 
                    artist_id = $artistId, 
                    series_id = $seriesId
                WHERE Issue.id = $issueId
                `;
                const values = {
                    $name: updatedIssue.name,
                    $issueNumber: updatedIssue.issueNumber,
                    $publicationDate: updatedIssue.publicationDate,
                    $artistId: updatedIssue.artistId,
                    $seriesId: req.params.seriesId,
                    $issueId: req.params.issueId
                };
                db.run(sql, values, function(err) {
                    if (err) {
                        console.log('error from updating table');
                        next(err);
                    } else {
                        db.get("SELECT * FROM Issue WHERE id = $id", {$id: req.params.issueId}, function(err, issue) {
                            if (err) {
                                console.log('error from retrieving updated issue');
                                next(err);
                            } else {
                                res.status(200).json({issue: issue});
                            }
                        })
                    }
                })
            } else {
                res.sendStatus(400)
            }
        })
    }
});

issuesRouter.delete('/:issueId', function(req,res,next) {
    const sql = "SELECT * FROM Issue WHERE id = $issueId";
    const value = {$issueId: req.params.issueId}
    
    db.get(sql, value, function(err, issue) {
        if (err) {
            next(err);
        } else if (issue) {
            const sql = `DELETE FROM Issue WHERE id = $issueId`;
            const value = {$issueId: req.params.issueId};
            db.run(sql, value, function(err) {
                if (err) {
                    next(err);
                } else {
                    res.sendStatus(204);
                }
            })
        }
    })
})