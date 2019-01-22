import React, { Component } from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Header from './components/header/header';
import Footer from './components/footer/footer';
import Home from './components/home/home';
import Seed from './components/seed/seed';
import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App container-fluid">
            <Header />
            <Route exact path = "/" component={Home} />
            <Route exact path = "/seed" component={Home} />
            <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
