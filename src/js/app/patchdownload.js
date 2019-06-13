const FileSaver = require('file-saver');
const BlobUtil = require('blob-util');

import {parseIPS} from './parseIPS';
import {readPointer,writePointer} from './romhelper';

const fileInput = document.getElementById('file') || document.createElement('div');
const selectedGame = location.pathname.substr(1,3);
const seed = location.pathname.slice(5);
const endpoint = location.href.substr((location.href.indexOf(location.host) + location.host.length));
const seasonsMusicPatch = [{offset: 3190, data: 205}, {offset: 3191, data: 200}, {offset: 3192, data: 62}];
const agesMusicPatch = [{offset: 3226, data: 205}, {offset: 3227, data: 248}, {offset: 3228, data: 62}];
const agesLinkObjectPaletteOffsets =
  [82446,82448,82450,82452,82454,82456,82458,82460,82462,82464];

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
                [173,226,249,53,139,241,0,0,0], // blue (inverted)
                [248,197,110,234,75,55,0,0,0], // red (inverted)
                ];   

// Default palettes for sprites
const defaultPalettes = {
  link: 0,
  marin: 3,
};

var spriteImages = {};


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

      if (linkPalette > 0 && linkPalette < 6){
        // Seasons Object palette offsets are 66 less than ages
        const LinkPaletteOffsets = chosenGame == "ooa" ? agesLinkObjectPaletteOffsets : agesLinkObjectPaletteOffsets.map((x,i)=>{
          return x - 66;
        });
        LinkPaletteOffsets.forEach(offset=>{
          rom_array[offset] = rom_array[offset] | linkPalette;
        });

        const linkOamTable = chosenGame == "ooa" ? 0x1a0a7 : 0x19d9e;
        const oamBank = chosenGame == "ooa" ? 0x13 : 0x12;

        // Preserve the palettes of everything that's not link's color (ie. harp)
        for (let i=0; i<48; i++) {
          var addr = readPointer(rom_array, linkOamTable + i*2, oamBank);
          var count = rom_array[addr];
          addr++;
          for (let j=0; j<count; j++) {
            if ((rom_array[addr+3] & 7) != 0) {
              if (i >= 46 && linkPalette >= 4) // Harp only: use inverted palettes
                rom_array[addr+3] = (rom_array[addr+3] & ~7);
              else // Everything else: use its original palette
                rom_array[addr+3] ^= linkPalette;
            }
            addr += 4;
          }
        }

        // Address of standard sprite palettes
        const paletteSrc = chosenGame == "ooa" ? 0x5c8f0 : 0x58840;
        // Free space to put modified copy of sprite palettes for file select screen
        const fileSelectPaletteAddr = chosenGame == "ooa" ? 0x5eee3 : 0x5ba07;
        // Copy normal palettes
        for (let x=8; x<8*4; x++)
          rom_array[fileSelectPaletteAddr + x] = rom_array[paletteSrc + x];
        // Replace first palette (green) with appropriate one
        for (let x=0; x<8; x++)
          rom_array[fileSelectPaletteAddr + x] = rom_array[paletteSrc + x + linkPalette * 8];
        // Replace file select's palette reference to newly created data
        if (chosenGame == "ooa") {
          writePointer(rom_array, 0x64de, fileSelectPaletteAddr);
          writePointer(rom_array, 0x64ea, fileSelectPaletteAddr);
        }
        else {
          writePointer(rom_array, 0x6428, fileSelectPaletteAddr);
          writePointer(rom_array, 0x6434, fileSelectPaletteAddr);
        }

        if (linkPalette >= 4) {
          // For "inverted" palettes, change the damage-taking palette to 1 or
          // 2 (depending if it's red or blue).
          const damagePalette = (linkPalette-3) | 8;
          if (chosenGame == "ooa")
            rom_array[0x14290] = damagePalette;
          else
            rom_array[0x1424e] = damagePalette;
        }
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
    if (spriteImages[linkSprite])
      display(spriteImages[linkSprite]);
    else {
      const gifReq = new Request(`/img/${linkSprite}.gif`, {method: "GET"});
      fetch(gifReq).then(gifRes=>{
        gifRes.arrayBuffer().then(buffer=>{
          spriteImages[linkSprite] = buffer;
          display(buffer);
        });
      });
    }

    function display(buffer) {
      const gif_array = new Uint8Array(buffer);
      if (linkPalette > -1 && linkPalette < 6){
        palette[linkPalette].forEach((val,i)=>{
          gif_array[i + 13] = val;
        })
      }
      const blob = new Blob([gif_array], { type: 'image/gif'});
      const baseURL = window.URL;
      var imgURL = baseURL.createObjectURL(blob);
      imgEl.src = imgURL;
    }
  }
 
  displayLink(parseInt(paletteSelect.value) || 0);
}
