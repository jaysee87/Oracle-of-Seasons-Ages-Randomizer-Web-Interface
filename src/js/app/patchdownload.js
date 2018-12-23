const FileSaver = require('file-saver');
const selectedGame = location.pathname.substr(1,3);
const seed = location.pathname.slice(5);
const seasonsMusicPatch = [{offset: 3190, data: 205}, {offset: 3191, data: 200}, {offset: 3192, data: 62}];
const agesMusicPatch = [{offset: 3226, data: 205}, {offset: 3227, data: 248}, {offset: 3228, data: 62}];

export function loadDownloadListeners(gameStore){
  const musicBtn = document.getElementById('music') || document.createElement('div');
  const noMusicBtn = document.getElementById('no-music') || document.createElement('div');

  musicBtn.addEventListener('click', e=>{
    e.preventDefault();
    getAndApplySeedData(false);
  });

  noMusicBtn.addEventListener('click', e=>{
    e.preventDefault();
    getAndApplySeedData(true);
  });

  function getAndApplySeedData(nomusic){
    // api/oo(s/a)/id
    const url = `/api/${selectedGame}/${seed}`;
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

    fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }).then(resp => {
          resp.json().then( respJSON => {
            // respJSON.patch should be an Array of objects in {"offset": "data"} format
            const patchArray = respJSON.patch;
            console.log(respJSON);
            if (nomusic){
              musicPatch.forEach(bytePatch => {
                patchArray.push(bytePatch);
              })
            }
            console.log(selectedGame);
            console.log(gameStore[selectedGame])
            const rom_array = new Uint8Array(gameStore[selectedGame]);
            patchArray.forEach( bytePatch => {
              // Each index of rom_array is the same as memory offset on rom
              rom_array[bytePatch.offset] = bytePatch.data;
            })
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

            FileSaver(finishedRom, `${selectedGame}-webrandomizer-${seed}${argsString}.gbc`);
          })
        }).catch( err => {
          console.log(err);
        })
  }
}