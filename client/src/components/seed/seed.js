import React, { Component } from 'react';
import axios from 'axios';
import Spinner from '../spinner/spinner';
import FileSelect from '../common/FileSelect';
import './seed.css';

class seed extends Component {
  constructor(){
    super();
    this.state = {
      loading: true,
      seedData: null
    }
  }

  componentWillMount(){
    console.log(this.props);
    if (!["oos", "ooa"].includes(this.props.match.params.game)){
      this.props.history.push('/randomize');
    }
  }

  componentDidMount(){
    const {game, seed} = this.props.match.params;
    axios.get(`/api/${game}/${seed}`)
      .then(res => {
        this.setState({
          loading: false,
          seedData: res.data
        })
      })
      .catch(err => {
        console.log('Unable to retrieve');
      })
  }

  render() {
    const {game, seed} = this.props.match;
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
    
          <ul className="mt-5">
            <FileSelect game={gameTitle} />

            <div className="btn-group btn-group-lg mt-4">
              <button type="button" className="btn btn-primary btn-download" id="music" disabled>Save Rom (Music)</button>
              <button type="button" className="btn btn-secondary btn-download" id="no-music" disabled>Save Rom (No Music)</button>
            </div>
          </ul>
        </div>
      )
      titleText = `Oracle of ${gameTitle} (${seedData.version})`
    }


    return (
      <div className="container">
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

export default seed;