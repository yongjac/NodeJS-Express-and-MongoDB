const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({ user: req.user._id })
    .populate('user')
    .populate('dishes')
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then((favorite) => {
        if (favorite == null) {
            Favorites.create({ user: req.user._id })
            .then((favorite) => {
                for (var i in req.body) {
                    favorite.dishes.push(req.body[i]._id);
                }
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })          
                }, (err) => next(err));
            }, (err) => next(err));
        }
        else if (favorite.dishes == null || !favorite.dishes.includes(req.body._id)) {
            for (var i in req.body) {
                favorite.dishes.push(req.body[i]._id);
            }
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })          
            }, (err) => next(err));
        }
        else {
            err = new Error('Dish ' + req.body._id + ' already exists');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({ user: req.user._id })
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then((favorite) => {
        if (favorite != null && !favorite.dishes.includes(req.params.dishId)) {
            favorite.dishes.push(req.params.dishId);
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })          
            }, (err) => next(err));
        }
        else if (favorite == null) {
            err = new Error('Favorite not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' already exists');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then((favorite) => {
        if (favorite != null && favorite.dishes.includes(req.params.dishId)) {
            favorite.dishes.remove(req.params.dishId);
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })          
            }, (err) => next(err));
        }
        else if (favorite == null) {
            err = new Error('Favorite not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;