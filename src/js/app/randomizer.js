export function loadRandomizerEvents(gameStore, setFileInput){
  const gameTitle = document.getElementById('game-title');
  const randomizerForm = document.getElementById('randomize-settings');
  const seasonsToggle = document.getElementById('seasons');
  const agesToggle = document.getElementById('ages');
  const loadingImg = document.getElementById('loading');
  const submitBtn = document.getElementById('submitBtn');
  const fileInput = document.getElementById('file');
  const clsGame = 'btn btn-secondary';
  const clsActive = clsGame + ' active';
  const baseTitle = "Randomize Oracle of ";

  loadingImg.hidden = true;
  randomizerForm.parentElement.parentElement.hidden = false;

  seasonsToggle.addEventListener('change', e=>{
    seasonsToggle.parentElement.className = clsActive;
    agesToggle.parentElement.className = clsGame;
    gameTitle.innerText = baseTitle + "Seasons";
    submitBtn.innerText = "Randomize Seasons";
    setFileInput(fileInput, "oos", "Seasons", gameStore)
  });

  agesToggle.addEventListener('change', e=>{
    agesToggle.parentElement.className = clsActive;
    seasonsToggle.parentElement.className = clsGame;
    gameTitle.innerText = baseTitle + "Ages";
    submitBtn.innerText = "Randomize Ages";
    setFileInput(fileInput, "ooa", "Ages", gameStore)
  });

  randomizerForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    randomizerForm.parentElement.parentElement.hidden = true;
    loadingImg.hidden = false;
    const formData = new FormData(randomizerForm);
    const game = formData.get("game-option");
    const hardMode = formData.has("hard");
    const treeWarp = formData.has("tree");
    const settings = {
    game: game,
    hardMode: hardMode,
    treeWarp: treeWarp,
    };
    console.log(settings);
    fetch("/api/randomize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(settings),
    }).then(resp => {
        resp.text().then(respText =>{
          window.location = respText;
        })
      }).catch( err => {
        console.log(err);
      })
  })
}