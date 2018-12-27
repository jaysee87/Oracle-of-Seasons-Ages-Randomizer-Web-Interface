const FileSaver = require('file-saver');
const BlobUtil = require('blob-util');
const selectedGame = location.pathname.substr(1,3);
const seed = location.pathname.slice(5);
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
const gifReq = new Request("/img/Link.gif", {method: "GET"});

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

export function loadDownloadListeners(gameStore){
  fetch(gifReq).then(gifRes=>{
    gifRes.arrayBuffer().then(buffer=>{
      const gif_array = new Uint8Array(buffer);
      loadListeners(gameStore, gif_array);
    });
  });
}

function loadListeners(gameStore, gif_array){
  const musicBtn = document.getElementById('music') || document.createElement('div');
  const noMusicBtn = document.getElementById('no-music') || document.createElement('div');
  const paletteSelect = document.getElementById('paletteIndex');

  paletteSelect.addEventListener('change', e=>{
    const pIndex = parseInt(paletteSelect.value) || 0;
    displayLink(pIndex);
  })

  musicBtn.addEventListener('click', e=>{
    e.preventDefault();
    getAndApplySeedData(false);
  });

  noMusicBtn.addEventListener('click', e=>{
    e.preventDefault();
    getAndApplySeedData(true);
  });

  function getAndApplySeedData(nomusic){
    let musicPatch;
    switch(selectedGame){
      case "oos":
        musicPatch = seasonsMusicPatch;
        break;
      case "ooa":
        musicPatch = agesMusicPatch;
        break;
      default:
        musicPatch = [];
    }
    fetch(patchReq).then(resp => {
          resp.json().then( respJSON => {
            // respJSON.patch should be an Array of objects in {"offset": "data"} format
            const patchArray = respJSON.patch;
            if (nomusic){
              musicPatch.forEach(bytePatch => {
                patchArray.push(bytePatch);
              })
            }
            const rom_array = new Uint8Array(gameStore[selectedGame]);
            patchArray.forEach( bytePatch => {
              // Each index of rom_array is the same as memory offset on rom
              rom_array[bytePatch.offset] = bytePatch.data;
            })
          
            const pIndex = parseInt(paletteSelect.value) || 0;
            if (pIndex > 0 && pIndex < 4){
              // Seasons File Offsets are 64 less than Ages, Object Offsets are 66 less
              const LinkPaletteOffsets = selectedGame == "ooa" ? agesLinkPaletteOffsets : agesLinkPaletteOffsets.map((x,i)=>{
                return i > 21 ? x - 66 : x - 64;
              });
              LinkPaletteOffsets.forEach(offset=>{
                rom_array[offset] = rom_array[offset] | pIndex;
              })
            }

            const finishedRom = new Blob([rom_array]);
            let argsString = '';
            if (respJSON.hard){
              argsString += '-hard';
            }
            if (respJSON.treewarp){
              argsString += '-treewarp';
            }
            if (nomusic){
              argsString += '-nomusic';
            }
            console.log(finishedRom);
            FileSaver.saveAs(finishedRom, `${selectedGame}-webrandomizer-${seed}${argsString}.gbc`);
          })
        }).catch( err => {
          console.log(err);
        })

        
  }

  /*
  *  Link.gif is an indexed color gif, function just edits the palette data and rerenders the gif to the selected 
  *  palette.
  */
  function displayLink(index){
    if (index > -1 && index < 4){
      palette[index].forEach((val,i)=>{
        gif_array[i + 13] = val;
      })
    }
    const blob = new Blob([gif_array], { type: 'image/gif'});
    const baseURL = window.URL;
    var imgURL = baseURL.createObjectURL(blob);
    imgEl.src = imgURL;
  }
 
  displayLink(parseInt(paletteSelect.value) || 0);
}