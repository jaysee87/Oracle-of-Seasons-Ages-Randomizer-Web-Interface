import React, { Component } from 'react';
import './seed.css';

class seed extends Component {
  render() {
    return (
      <div className="container">
        <div className="card">
          <div className="card-header bg-header">
            <div className="col">
              <h3>
                Oracle of Seasons(v3.3.2)
              </h3>
            </div>
          </div>
          <div className="card-body">
            <a href="/{{#if seed.oos}}oos{{else}}ooa{{/if}}/{{seed.seed}}">Shareable Link</a>
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
                  <img src=""  alt="Link-Sprite" className="mr-3" id="link-sprite"></img>
                
                  <div className="media-body">
                    <h3>Link Palette Selection</h3>
                    <div className="input-group">
                      <select className="custom-select" name="paletteIndex" id="paletteIndex">
                        <option selected>Choose a color...</option>
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
            
            <ul>
              <form action="#" method="POST" enctype="multipart/form-data" id="randomize-settings" styleName='randomForm'>        
                <div className="custom-file">
                  <input type="file" name="file" id="file" className="custom-file-input" required></input>
                  <label for="file" className="custom-file-label">Select Oracle of Seasons Rom (English)</label>
                </div>     
              </form>

              <div className="btn-group btn-group-lg" styleName='buttonGroup' >
                <button type="button" className="btn btn-primary btn-download" id="music" disabled>Save Rom (Music)</button>
                <button type="button" className="btn btn-secondary btn-download" id="no-music" disabled>Save Rom (No Music)</button>
              </div>
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

export default seed;