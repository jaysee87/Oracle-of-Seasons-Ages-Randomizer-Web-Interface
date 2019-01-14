const express = require('express');
const router = express.Router();
const OOS = require('../models/OOSSeed');
const OOA = require('../models/OOASeed');
const version = require('../base/version');

router.all('/*', (req, res, next)=>{
  req.app.locals.layout = 'home'
  next();
});

router.get('/', (req,res)=>{
  res.render('home/index', {host: req.get('host'), version: version});
});

router.get('/randomize', (req,res)=>{
  res.render('home/randomize', {host: req.get('host'), version: version});
});

router.get('/:game/:id', (req, res)=>{
  let OO = req.params.game == "oos" ? OOS : OOA

  OO.findOne({seed: req.params.id})
    .populate({path: 'base'})
    .then (seed =>{
    console.log(seed.base.version);
    response = {
      host: req.get('host'),
      oos: req.params.game == "oos", // Used for handlebars display logic
      seed: seed.seed,
      hard: seed.hard,
      treewarp: seed.treewarp,
      version: seed.base.version
    }
    res.render('home/seed', {host: req.get('host'), seed: response, version: version});
  }).catch(err =>{
    response = {
      game: req.params.game == "oos" ? "Seasons" : "Ages",
      seed: req.params.id
    }
    res.render('home/error', {seed: response, version: version})
  })
});

router.get('/settingspatch', (req,res)=>{
  res.render('home/exist');
})
module.exports = router;
