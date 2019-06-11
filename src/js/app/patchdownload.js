const FileSaver = require('file-saver');
const BlobUtil = require('blob-util');

import {parseIPS} from './parseIPS';

const fileInput = document.getElementById('file') || document.createElement('div');
const selectedGame = location.pathname.substr(1,3);
const seed = location.pathname.slice(5);
const endpoint = location.href.substr((location.href.indexOf(location.host) + location.host.length));
const seasonsMusicPatch = [{offset: 3190, data: 205}, {offset: 3191, data: 200}, {offset: 3192, data: 62}];
const agesMusicPatch = [{offset: 3226, data: 205}, {offset: 3227, data: 248}, {offset: 3228, data: 62}];
const agesLinkPaletteOffsets = [36230,36234,36239,36243,36248,36252,36257,36261,
                                36274,36278,36291,36295,36304,36308,36317,36321,
                                36338,36342,36359,36363,36376,36380,82446,82448,
                                82450,82452,82454,82456,82458,82460,82462,82464];

const imgEl = document.getElementById('link-sprite');
const patchURL = `/api/${selectedGame}/${seed}`;
const patchReq = new Request(patchURL, {
  method: "GET",
  headers: {
    "Content-Type": "application/json; charset=utf-8"
  }
});

/*
*  Array of Palette Arrays for gif
* 
*  Col 0 is transparent, so just need col1-col3
*  Each Array is in format of:
*  [col1-r, col1-g, col1-b, col2-r, col2-g, col2-b, col3-r, col3-g, col3-b]
*  Needed offset for gif palette starts at 0x0D and ends at 0x15
*/
const palette = [[0,0,0,38,142,68,236,190,166],
                [0,0,0,51,158,191,236,190,166], // blue
                [0,0,0,205,16,75,236,190,166], // red
                [0,0,0,217,92,97,236,190,166], // gold
                ];   

// Default palettes for sprites
const defaultPalettes = {
  link: 0,
  marin: 3,
};


var linkPalette = 0;
var linkSprite = 'link';


export function loadDownloadListeners(gameStore){
  const musicBtn = document.getElementById('music') || document.createElement('div');
  const noMusicBtn = document.getElementById('no-music') || document.createElement('div');
  const paletteSelect = document.getElementById('paletteIndex');
  const spriteSelect = document.getElementById('linkSprite');

  paletteSelect.addEventListener('change', e=>{
    linkPalette = parseInt(paletteSelect.value) || 0;
    displayLink();
  });
  
  spriteSelect.addEventListener('change', e=>{
    linkSprite = spriteSelect.value || 'link';
    linkPalette = defaultPalettes[linkSprite];
    paletteSelect.value = `${linkPalette}`
    displayLink();
  });

  musicBtn.addEventListener('click', e=>{
    e.preventDefault();
    getAndApplySeedData(false);
  });

  noMusicBtn.addEventListener('click', e=>{
    e.preventDefault();
    getAndApplySeedData(true);
  });

  function getAndApplySeedData(nomusic){
    if (endpoint == "/settingspatch"){
      const reader = new FileReader();
      reader.onloadend = e =>{
        applyPatch([], reader.result, nomusic, '', 'prerandomized');
      }
      reader.readAsArrayBuffer(fileInput.files[0]);
    } else {
      fetch(patchReq).then(resp => {
            resp.json().then( respJSON => {
              // respJSON.patch should be an Array of objects in {"offset": "data"} format
              const patchArray = respJSON.patch;
              let argsString = '';
              if (respJSON.hard){
                argsString += '-hard';
              }
              if (respJSON.treewarp){
                argsString += '-treewarp';
              }
              applyPatch(patchArray, gameStore[selectedGame], nomusic, argsString, seed)
            })
          }).catch( err => {
            console.log(err);
          })
    }        
  }

  function getMagicText(rom_array){
    let magicString = '';
    for (let i = 308; i < 319; i++){
      magicString += String.fromCharCode(rom_array[i]);
    }
    if(magicString.includes("ZELDA NAYRU")) {
      return "ooa";
    } else if(magicString.includes("ZELDA DIN")){
      return "oos";
    }
  }

  function applyPatch(patchArray, rom, nomusic, argsString, seedstring){
    const rom_array = new Uint8Array(rom);
    let musicPatch;
    let chosenGame = getMagicText(rom_array);
    switch(chosenGame){
      case "oos":
        musicPatch = seasonsMusicPatch;
        break;
      case "ooa":
        musicPatch = agesMusicPatch;
        break;
      default:
        musicPatch = [];
    }
    if (nomusic){
      musicPatch.forEach(bytePatch => {
        patchArray.push(bytePatch);
      })
    }
    
    // Sprite patch
    if (linkSprite != 'link'){
      const ipsReq = new Request(`/patch/${linkSprite}-${chosenGame}.ips`, {method: "GET"});
      fetch(ipsReq).then(ipsRes=>{
        ipsRes.arrayBuffer().then(buffer=>{
          parseIPS(rom_array,buffer);
          finalizePatch();
        });
      });
    }
    else {
      finalizePatch();
    }
    
    function finalizePatch() {
      patchArray.forEach( bytePatch => {
        // Each index of rom_array is the same as memory offset on rom
        rom_array[bytePatch.offset] = bytePatch.data;
      })

      if (linkPalette > 0 && linkPalette < 4){
        // Seasons File Offsets are 64 less than Ages, Object Offsets are 66 less
        const LinkPaletteOffsets = chosenGame == "ooa" ? agesLinkPaletteOffsets : agesLinkPaletteOffsets.map((x,i)=>{
          return i > 21 ? x - 66 : x - 64;
        });
        LinkPaletteOffsets.forEach(offset=>{
          rom_array[offset] = rom_array[offset] | linkPalette;
        })
      }

      // All patches applied. Recalculate rom checksum.
      var checksum = 0
      for (let i=0; i<rom_array.length; i++) {
        if (i == 0x14e || i == 0x14f)
          continue;
        checksum += rom_array[i];
        checksum &= 0xffff;
      }
      rom_array[0x14e] = checksum >> 8;
      rom_array[0x14f] = checksum & 0xff;

      const finishedRom = new Blob([rom_array]);
      if (nomusic){
        argsString += '-nomusic';
      }
      FileSaver.saveAs(finishedRom, `${chosenGame}-${seedstring}${argsString}.gbc`);
    }
  }
  /*
  *  gifs are indexed color gifs, function just edits the palette data and rerenders the gif to the selected
  *  palette.
  */
  function displayLink(){
    const gifReq = new Request(`/img/${linkSprite}.gif`, {method: "GET"});
    fetch(gifReq).then(gifRes=>{
      gifRes.arrayBuffer().then(buffer=>{
        const gif_array = new Uint8Array(buffer);
        if (linkPalette > -1 && linkPalette < 4){
          palette[linkPalette].forEach((val,i)=>{
            gif_array[i + 13] = val;
          })
        }
        const blob = new Blob([gif_array], { type: 'image/gif'});
        const baseURL = window.URL;
        var imgURL = baseURL.createObjectURL(blob);
        imgEl.src = imgURL;
      });
    });
  }
 
  displayLink(parseInt(paletteSelect.value) || 0);
}
