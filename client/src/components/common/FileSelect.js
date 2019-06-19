import React from 'react';

function FileSelect({game}){
  return (
    <div className="col-md">
      <div className="custom-file">
        <input type="file" name="file" id="file" className="custom-file-input" required />
        <label htmlFor="file" className="custom-file-label">Select Oracle of {game} Rom (English)</label>
      </div>
    </div>
  )
}

export default FileSelect;