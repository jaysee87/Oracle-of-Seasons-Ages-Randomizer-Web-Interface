import React, { Component } from 'react';
import FileSelect from '../common/FileSelect';
import CheckBox from '../common/CheckBox';

const games = {
  oos: "Seasons",
  ooa: "Ages"
}

const checkboxes = [
  ["hard", "Hard Difficulty", "Requires more advanced knowledge and techniques concerning travel, alternate means of damagings enemies, getting seeds from locations other than trees, etc."],
  ["tree", "Tree Warp", "From an overworld location, warp to the main town's seed tree by opening the map, then hold start while closing the map. Does not affect item placement logic."],
  ["dungeons", "Shuffle Dungeons", "Dungeon entrance shuffle. No other entrances are shuffled."],
  ["portals", "Shuffle Portals", "Shuffle which portal in Holodrom leads to which portal in Subrosia."],
]

class randomize extends Component {
  constructor(){
    super();
    this.state = {
      game: "Seasons",
      hard: false,
      tree: false,
      dungeons: false,
      portals: false,
      verified: false,
    };

    this.selectGame = this.selectGame.bind(this);
    this.toggleCheck = this.toggleCheck.bind(this);
  }

  selectGame(e){
    this.setState({
      game: games[e.target.value]
    })
  }

  toggleCheck(e){
    e.preventDefault();
    let newState = !this.state[e.target.id];
    this.setState({[e.target.id]: newState});
  }

  render() {
    let gameToggle = Object.keys(games).map((game,i) => {
      let cName = "btn";
      if (games[game] === this.state.game){
        cName += " btn-info"
      } else {
        cName += " btn-secondary"
      }

      if (i === 0){
        cName += " rounded-left"
      } else if (i === Object.keys(games).length - 1){
        cName += " rounded-right"
      }
      return (
        <button className={cName} id={games[game]} key={game} value={game} onClick={this.selectGame}> {games[game]}</button>
      )
    })

    const y = this.state.game === "Seasons" ? checkboxes.length : checkboxes.length - 1;
    const options = [];
    for (let x = 0; x < y; x++){
      options.push((<CheckBox key={checkboxes[x][0]} value={checkboxes[x][0]} label={checkboxes[x][1]} info={checkboxes[x][2]} checked={this.state[checkboxes[x][0]]} onCheck={this.toggleCheck}></CheckBox>))
    }
    return (
      <div className="container">
        <div className="card">
          <div className="card-header bg-header">
            <h2>Randomize Oracle of {this.state.game}</h2>
          </div>
          <div className="card-body">
            <form id="randomize-settings">
              <div className="row">
                <div className="col-sm">
                  <div className="btn-group btn-group-toggle" id="game-selector" data-toggle="buttons">
                    {gameToggle}
                  </div>
                </div>
                <FileSelect game={this.state.game}></FileSelect>
              </div>
              <div className="row mb-4 mt-3">
                {options}
              </div>
              <button className="btn btn-primary btn-lg btn-block" disabled={!this.state.verified}>Randomize {this.state.game}</button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default randomize;