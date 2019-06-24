import React, {Component} from 'react';

const checksums = {
  Ages: 'c4639cc61c049e5a085526bb6cac03bb',
  Seasons: 'f2dc6c4e093e4f8c6cbea80e8dbd62cb'
}

class FileSelect extends Component{
  render() {
    return (
      <div className="col-md">
        <div className="custom-file">
          <input type="file" name="file" id="file" className="custom-file-input" required />
          <label htmlFor="file" className="custom-file-label">Select Oracle of {this.props.game} Rom (English)</label>
        </div>
      </div>
    )
  }
}

export default FileSelect;