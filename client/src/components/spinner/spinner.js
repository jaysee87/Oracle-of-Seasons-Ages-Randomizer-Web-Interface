import React, { Component } from 'react';

export default class spinner extends Component {
  render() {
    return (
      <div className="media" id="loading" >
        <div className="col"></div>
        <div className="col"><img className="align-self-st" src="/img/Loading_2.gif" alt="" /></div>
        <div className="col"></div>
      </div>
    )
  }
}
