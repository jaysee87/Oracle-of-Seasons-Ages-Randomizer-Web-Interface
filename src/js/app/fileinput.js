const SparkMD5 = require('spark-md5');
const fileInput = document.getElementById('file') || document.createElement('div');
const fileLabel = fileInput.nextElementSibling;
const downloadBtns = document.querySelectorAll('.btn-download');
downloadBtns.forEach(btn=>{btn.disabled = true;})

export function loadFileListeners(localforage, gameStore){
  const endpoint = location.href.substr((location.href.indexOf(location.host) + location.host.length));
  const subPath = location.pathname.substr(1,3);
  // if returns true, then on patch download page, if not then on randomize page
  const validGame = subPath == "oos" || subPath == "ooa";
  const defaultgame = validGame ? subPath : "oos";
  const checksums = {
    ooa: 'c4639cc61c049e5a085526bb6cac03bb',
    oos: 'f2dc6c4e093e4f8c6cbea80e8dbd62cb'
  }

  if (gameStore[defaultgame] && endpoint != "/settingspatch"){
    const fullName = defaultgame == "oos" ? "Seasons" : "Ages";
    fileInput.disabled = true;
    downloadBtns.forEach(btn=>{btn.disabled = false;})
    setLabel(fileLabel, `Oracle of ${fullName} Rom loaded`, "green", "white");
  }

  function addGame(game, fileData){
    gameStore[game] = fileData;
    localforage.setItem(game, fileData)
      .then(val =>{
        setFileInput(fileInput, game, game == "oos" ? "Seasons" : "Ages", gameStore);
      }).catch(err =>{
        console.log(err);
      })
  }

  function checkMD5(){
    console.log(`Reading: ${fileInput.title}`);
    const reader = new FileReader();
    const game = fileInput.title || defaultgame;
    reader.onloadend = e =>{
      const spark = new SparkMD5.ArrayBuffer();
      spark.append(reader.result);
      const end = spark.end();
      if (end == checksums[game]){
        // addGame(game, fileInput.files[0]);
        addGame(game, reader.result);
      } else {
        setLabel(fileLabel, `Not a valid ${game} rom`, "red", "white")
      }      
    };
    if (fileInput.files.length > 0){
      reader.readAsArrayBuffer(fileInput.files[0]);
    }
  }

  function checkAgesSeasons(){
    const reader = new FileReader();
    reader.onloadend = e =>{
      let magicString = '';
      const result = new Uint8Array(reader.result);
      for (let i = 308; i < 319; i++){
        magicString += String.fromCharCode(result[i]);
      }
      if(magicString.includes("ZELDA NAYRU") || magicString.includes("ZELDA DIN")) {
        downloadBtns.forEach(btn=>{btn.disabled = false;})
        fileInput.disabled = true;
        setLabel(fileLabel, "Oracles Rom Loaded", "green", "white")
      } else {
        downloadBtns.forEach(btn=>{btn.disabled = true;})
        setLabel(fileLabel, "Not an Oracles Rom", "red", "white")
      }
    }
    reader.readAsArrayBuffer(fileInput.files[0]);
  }

  fileInput.addEventListener('change', (e)=>{
    if (endpoint == '/settingspatch'){
      checkAgesSeasons();
    } else {
      checkMD5();
    }
  });
}

export function setFileInput(input, game, fullName, gameStore){
  input.files = null;
  input.title = game;
  if (gameStore[game]){
    input.disabled = true;
    downloadBtns.forEach(btn =>{btn.disabled = false})
    setLabel(input.nextElementSibling, `Oracle of ${fullName} Rom loaded`, "green", "white");
  } else {
    input.disabled = false;
    downloadBtns.forEach(btn =>{btn.disabled = true})
    setLabel(input.nextElementSibling, `Select Oracle of ${fullName} Rom (English)`, "white", "gray");
  }
}

function setLabel(el, labelText, bgColor, color){
  el.innerText = labelText;
  el.style.backgroundColor = bgColor;
  el.style.color = color;
}