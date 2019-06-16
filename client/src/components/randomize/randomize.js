import React, { Component } from 'react'

class randomize extends Component {
  render() {
    return (
      <div className="container">
        <div className="card" id="randomize-card">
          <div className="card-header bg-header">
            <h2 id="game-title">Randomize Oracle of Seasons</h2>
          </div>
          <div className="card-body">
            <form action="#" method="POST" enctype="multipart/form-data" id="randomize-settings">
              <div className="row">
                <div className="col-sm">
                  <div className="btn-group btn-group-toggle" id="game-selector" data-toggle="buttons">
                    <label className="btn btn-secondary active">
                      <input type="radio" name="game-option" id="seasons" value="oos" autocomplete="off" checked /> Seasons
                    </label>
                    <label className="btn btn-secondary">
                      <input type="radio" name="game-option" id="ages" value="ooa" autocomplete="off" /> Ages
                    </label>
                  </div>
                </div>
                <div className="col-md">
                  <div className="custom-file">
                    <input type="file" name="file" id="file" className="custom-file-input" required />
                    <label for="file" className="custom-file-label">Select Oracle of Seasons Rom (English)</label>
                  </div>
                </div>
                
              </div>
              <div className="form-check form-check-inline">
                <input type="checkbox" name="hard" id="hard" value="hard" />
                <label for="hard" className="form-check-label"> Hard Difficulty?</label>
              </div>
              <div className="form-check form-check-inline">
                <input type="checkbox" name="tree" id="tree" value="tree" />
                <label for="tree" className="form-check-label"> Tree Warp?</label>
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-download" id="submitBtn" disabled>Randomize Seasons</button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default randomize;