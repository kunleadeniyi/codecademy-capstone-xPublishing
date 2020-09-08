const express = require('express');
const artistRouter = express.Router();

module.exports = artistRouter;

// importing sqlite and assessing the database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistRouter.param('artistId', function(req, res, next, artistId) {
    // const artistId = Number(id);
    const sql = `SELECT * FROM Artist WHERE id = $id`;
    const value = {$id: artistId};
    db.get(sql, value, function(err, artist) {
        if (err) {
            next(err);
        } else if (artist) {
            req.artist = artist;
            next()
        } else {
            res.sendStatus(404);
        }
    });
});

artistRouter.get('/', function(req, res, next) {
    db.all('SELECT * FROM Artist WHERE is_currently_employed = 1', function(err, row) {
        if (err) {
            next(err);
        } else {
            res.status(200).json({artists: row});
        }
    })
});

artistRouter.get('/:artistId', function(req,res,next) {
    res.status(200).json({artist: req.artist})
    // console.log(req.artist);
});

artistRouter.post('/', function(req, res, next) {
    const newArtist = req.body.artist;
    if (!newArtist.name || !newArtist.dateOfBirth || !newArtist.biography ) {
        res.sendStatus(400);
    } else {
        if (newArtist.isCurrentlyEmployed !== 1) {
            newArtist.isCurrentlyEmployed = 1;
        };
        const sql = `INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)
        VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`;
        const values = {$name: newArtist.name, 
            $dateOfBirth: newArtist.dateOfBirth, 
            $biography: newArtist.biography, 
            $isCurrentlyEmployed: newArtist.isCurrentlyEmployed
        }
        db.run(sql, values, function(err) {
            if (err) {
                next(err);
            };
            db.get(`SELECT * FROM Artist WHERE id = $id`, {$id: this.lastID}, function(err, artist) {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({artist: artist});
                }
            })
        })
    }
});

artistRouter.put('/:artistId', function(req,res,next) {
    const updatedArtist = req.body.artist;
    if (!updatedArtist.name || !updatedArtist.dateOfBirth || !updatedArtist.biography ) {
        res.sendStatus(400);
    } else {
        const sql = `UPDATE Artist 
        SET name = $name, 
            date_of_birth = $dateOfBirth, 
            biography = $biography, 
            is_currently_employed = $isCurrentlyEmployed 
        WHERE Artist.id = $artistId`;
        const values = {
            $name: updatedArtist.name,
            $dateOfBirth: updatedArtist.dateOfBirth,
            $biography: updatedArtist.biography,
            $isCurrentlyEmployed: updatedArtist.isCurrentlyEmployed,
            $artistId: req.params.artistId
        };
        db.run(sql, values, function(err) {
            if (err) {
                next(err)
            };
            db.get(`SELECT * FROM Artist WHERE id = $id`, {$id: req.params.artistId}, function(err, artist) {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({artist: artist});
                }
            })
        })
    }
})

artistRouter.delete('/:artistId', function(req,res,next) {
    const sql = `UPDATE Artist 
    SET is_currently_employed = 0
    WHERE Artist.id = $artistId`;
    const values = {$artistId: req.params.artistId};

    db.run(sql, values, function(err) {
        if (err) {
            next(err)
        };
        db.get(`SELECT * FROM Artist WHERE id = $id`, {$id: req.params.artistId}, function(err, artist) {
            if (err) {
                next(err);
            } else {
                res.status(200).json({artist: artist});
            }
        })
    });
})