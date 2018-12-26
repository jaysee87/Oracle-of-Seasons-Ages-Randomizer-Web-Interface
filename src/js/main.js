if (!window.FileReader){
  const redirect = `http://${location.host}/unsupported`
  window.location = redirect;
}

window.addEventListener('error', err=>{
  console.log(err)
})

const localforage = require('localforage');
const gameStore = {};

import {loadFileListeners, setFileInput} from './app/fileinput';
import {loadRandomizerEvents} from './app/randomizer';
import {loadDownloadListeners} from './app/patchdownload';
const endpoint = location.href.substr((location.href.indexOf(location.host) + location.host.length));

localforage.config({
  driver: localforage.INDEXEDDB,
  name: "oosarando",
  // name: "games",
  storeName: "games"
});

function loadListeners(){
  if (endpoint.length > 1){
    loadFileListeners(localforage, gameStore);
    if (endpoint == '/randomize'){
      loadRandomizerEvents(gameStore, setFileInput);  
    } else {
      loadDownloadListeners(gameStore);
    }
  }
}

localforage.keys().then(keys =>{
  if (keys.length > 0){
    localforage.iterate((val, k)=>{
      gameStore[k] = val;
    }).then(()=>{
      loadListeners();
    }).catch(err=>{
      console.log(err);
    });
  } else {
    loadListeners();
  }
})


