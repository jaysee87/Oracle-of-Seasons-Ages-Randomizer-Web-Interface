import React, { Component } from 'react';
import axios from 'axios';
import {checkStore} from '../Utility/storage';
import Spinner from '../Spinner/Spinner';
import FileSelect from '../Common/FileSelect';
import Log from '../Log/Log';
import './Seed.css';

class Seed extends Component {
  constructor(){
    super();
    this.state = {
      loading: true,
      seedData: null,
      game: null,
    }

    this.setValid = this.setValid.bind(this);
    this.checkGame = this.checkGame.bind(this);
  }

  checkGame(){
    checkStore(this.state.game || "Seasons", this.setValid);
  }

  setValid(valid){
    if (!this.state.valid){
      this.setState({
        valid: valid
      })
    }
  }

  componentWillMount(){
    if (!["oos", "ooa"].includes(this.props.match.params.game)){
      this.props.history.push('/randomize');
    }
  }

  componentDidMount(){
    const {game, seed} = this.props.match.params;
    const storageLabel = game === 'oos' ? 'Seasons' : 'Ages';
    axios.get(`/api/${game}/${seed}`)
      .then(res => {
        this.setState({
          loading: false,
          seedData: res.data,
          game: storageLabel
        })
      })
      .catch(err => {
        console.log('Unable to retrieve');
      })
  }

  componentDidUpdate(){
    this.checkGame();
  }

  render() {
    const {game, seed} = this.props.match.params;
    const {seedData} = this.state;
    let bodyContent;
    let titleText;
    const gameTitle = game === "oos" ? "Seasons" : "Ages"

    // TODO Create array of toggled features and map to JSX
    // TODO Create array of sprites and map to JSX

    if (this.state.loading) {
      bodyContent = (<div className="card-body"><Spinner /></div>)
      titleText = `Fetching Oracle of ${gameTitle} Seed...`
    } else {
      bodyContent = (
        <div className="card-body">   
          <a href={`/${game}/${seed}`}>Shareable Link</a>
          <div className="card-group">
            <div className="card">
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  
                  <li className="list-group-item text-white bg-success"><i className="fas fa-check"></i> Hard Mode On</li>

                
                  <li className="list-group-item text-white bg-success"><i className="fas fa-check"></i> Tree Warp Enabled</li>
                </ul>
              </div>
            </div>
            <div className="card">
              <div className="mt-4 media">
                <img src="/img/link.gif"  alt="Link-Sprite" className="mr-3" id="link-sprite"></img>
              
                <div className="media-body">
                  <h3>Link Palette Selection</h3>
                  <div className="input-group">
                    <select className="custom-select" name="paletteIndex" id="paletteIndex">
                      <option value="0">Green</option>
                      <option value="1">Blue</option>
                      <option value="2">Red</option>
                      <option value="3">Gold</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
    
          <div className="row my-5 px-4">
            <button type="button" className="btn btn-primary btn-block col-3" id="music" disabled={!this.state.valid}>Save Rom</button>
            <FileSelect game={game === 'oos' ? 'Seasons' : 'Ages'} inline={true} checkGame={this.checkGame} valid={this.state.valid}/>
          </div>
          <Log game={this.props.match.params.game} mode="seed" spoiler={seedData.spoiler}/>
        </div>
      )
      titleText = `Oracle of ${gameTitle} (${seedData.version})`
    }


    return (
      <div className="container-fluid" id="base">
        <div className="card">
          <div className="card-header bg-header">
            <div className="col">
              <h3>
                {titleText}
              </h3>
            </div>
          </div>
          {bodyContent}
        </div>
      </div>
    )
  }
}

export default Seed;