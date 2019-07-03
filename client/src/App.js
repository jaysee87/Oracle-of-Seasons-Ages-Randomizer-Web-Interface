import React, { Component } from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import axios from 'axios';
import Header from './components/header/header';
import Footer from './components/footer/footer';
import Home from './components/home/home';
import Randomize from './components/randomize/randomize';
import Seed from './components/seed/seed';
import './App.css';

class App extends Component {
  constructor(){
    super();
    this.state = {
      version: "v "
    };
  }

  componentWillMount(){
    axios.get('/api/version')
      .then(res => {
        this.setState({
          version: `v${res.data.version}`
        })
        
      })
  }
  render() {
    return (
      <Router>
        <div className="App container-fluid">
            <Header />
            <Route exact path = "/" component={Home} />
            <Route exact path = "/randomize" component={Randomize} />
            <Route path = "/:game/:seed" component={Seed} />
            <Footer version={this.state.version}/>
        </div>
      </Router>
    );
  }
}

export default App;
