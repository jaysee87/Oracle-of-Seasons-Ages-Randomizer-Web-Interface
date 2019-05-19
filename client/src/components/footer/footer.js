import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Footer extends Component {
  render() {
    return (
      <footer className="footer">
        <div className="container-fluid bg-info">
          <span className="text-light">Randomizer ({this.props.version}) by jangler, Interface (v2.0.0) by jaysee87</span>
        </div>
    </footer>
    )
  }
}

Footer.propTypes = {
  version: PropTypes.string.isRequired
}

export default Footer;