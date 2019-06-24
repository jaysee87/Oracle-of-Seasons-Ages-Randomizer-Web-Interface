const express = require('express');
const router = express.Router();
const exec = require('child_process').execFile;
const fs = require('fs');
// For encoding the seed string, returns original seed data if module not found (module not available on git)
const seedHelper = require('../seedhelper/seedhelper') || function(nameline){ return null};
const Base = require('../models/Base');
const Addr = require('../models/Addr');
const OOS = require('../models/OOSSeed');
const OOA = require('../models/OOASeed');

const version = require('../base/version');

router.get('/version', (req, res)=>{
  res.json({version: version})
});

router.post('/randomize', (req,res)=>{
  /*
  * Expects from req.body:
  *   game:          'oos' or 'ooa'  (just append ".blob" to get file to pass into randomizer)
  *   hardMode:      Boolean
  *   treeWarp:      Boolean
  *   dungeons:      Boolean
  *   portals:       Boolean
  * 
  * Returns a String containing the url for the seed page
  */
  const game = req.body.game;
  if (game !== 'oos' && game !== 'ooa') {
    return res.status(400).json({"nogame": "A valid game was not selected"});
  }
  const randoRoot = './base/'
  const randoName = process.env.OS == "Windows_NT" ? "oracles-randomizer.exe" : "oracles-randomizer";
  const randoExec = randoRoot + randoName;
  const gameFile = randoRoot + game + '.blob';
  const argsBase = ['-hard', '-treewarp', '-dungeons', '-portals'];
  const argsArray = [req.body.hardMode || false, req.body.treeWarp || false, req.body.dungeons || false, req.body.portals || false]
  const argsToSend = argsBase.filter((arg, i) => {return argsArray[i]});
  console.log(argsToSend);
  const hardMode = req.body.hardMode || false;
  const treeWarp = req.body.treeWarp || false;
  const dungeons = req.body.dungeons || false;
  const portals = req.body.portals || false;

  let nameBase = `${game}rando_${version}_`;
  const baselength = nameBase.length;
  let seedCollection = game === 'oos' ? OOS : OOA;

  const execArgs = [];
  if (hardMode){
    execArgs.push('-hard');
  }

  if (treeWarp){
    execArgs.push('-treewarp');
  }

  execArgs.push('-race','-noui', gameFile);
  exec(randoExec, execArgs, (err, out, stderr) => {
    if (err) {
      console.log("error");
      console.log(err);
      res.send(err);
      return
    } else {
      const lines = out.toString().split('\n');
      const fileInfo = lines.filter(line => line.includes(version))[0] // find correct line from rando output
        .split(' ').filter(word => word.includes(version))[0] // just the filename out of the string
        .split('_') // breaks the filename into different segments [base, version, seed]
      fileInfo[-1] = fileInfo[-1].split()
      console.log(fileInfo);
      const seed = fileInfo;
      const args = fileNameLine.substring(i+8, fileNameLine.length-4);
      const fileNameBase = `${nameBase}${seed}${args}`
      const encodedSeed = seedHelper(fileInfo.join('x')) || seed;
      
      fs.readFile( fileNameBase + '.gbc', (err2, target)=>{
        if (err2) {
          console.log("error 2");
          console.log(err2);
          res.send(err2);
          return
        }
        
        Addr.find({game: game})
          .sort({date: -1})
          .then(results =>{
            const result = results[0];
            const addrs = result.patchData;
            Base.find({game: game, version: version})
              .sort({date: -1})
              .then(bases => {
                // Base patch db entry needed so each seed has the correct fixes to the version if used after a new release
                const base = bases[0];
                const seedData = []
                // Only need to read a few hundred bytes from generated rom that is seed specific compared to all 1,048,576 bytes of two rom files
                addrs.forEach(offset =>{
                  bytePatch = {};
                  target.readUInt8(offset);
                  bytePatch.offset = offset;
                  bytePatch.data = target.readUInt8(offset);
                  seedData.push(bytePatch);
                })

                const newSeed = new seedCollection({
                  seed: encodedSeed,
                  baseSeed: seed,  // To be removed from future versions
                  patchData: seedData,
                  hard: hardMode,
                  treewarp: treeWarp,
                  dungeons: dungeons,
                  base: base.id
                })

                if (game === 'oos') {
                  newSeed.portals = portals;
                }
                
                newSeed.save().then( saved => {  
                  // Remove generated files and free some space              
                  fs.unlink(fileNameBase+'.gbc', err=>{if (err) console.log(err)});
                  fs.unlink(fileNameBase+'_log.txt',err=>{if (err) console.log(err)});
                  console.log("patch created");
                  res.send(`/${game}/${encodedSeed}`);
                  return;
                });                
              });            
          });     
        });
    }
  });
});

router.get('/:game/:id', (req,res)=>{
  /*
  * Ignores everything from req.body
  * 
  * :game should be equal to 'oos' or 'ooa' else it returns an error
  * 
  * :id is the encoded seed id
  * 
  * Returns an Object with the following keys:
  *   patch: Array of {offset: patch data} objects
  *   version: String indicating version of randomizer used
  *   hard: Boolean indicating if hard mode was enabled
  *   treewarp: Boolean indicating if treewarp was enabled
  *   dungeons: Boolean indicating if dungeon shuffle was enabled
  *   portals: Boolean indicating if subrosia portal was enabled  *   
  *   
  */
  const game = req.params.game;
  let seedCollection;
  switch (game){
    case "ooa":
      seedCollection = OOA;
      break;
    case "oos":
      seedCollection = OOS;
      break
    default:
      res.status(404).send("Seed not found");
  }

  // If seed is found, grabs Base patch data, then appends Seed Specific patch data and sent as key "patch" in the response
  seedCollection.findOne({seed: req.params.id}).then(seed=>{
    if(seed){
      Base.find({_id: seed.base})
        .then(bases => {
          const base = bases[0];
          const patchData = base.patchData;
          seed.patchData.forEach( bytePatch =>{
            patchData.push(bytePatch);
          })
          const response = {
            patch: patchData,
            version: version,
            hard: seed.hard,
            treewarp: seed.treewarp,
            dungeons: seed.dungeons,
          }
          if (game === "oos"){
            response.portals = seed.portals
          }
          res.send(response);
        });
    } else{
      res.send('unable to find seed');
    }
  }).catch(err =>{
    console.log(err)
    res.send('unable to locate');
  })
});

module.exports = router;