import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import HeaderComponent from "./Component/HeaderComponent";
import MapComponent from "./Component/MapComponent";
class App extends Component {
  render() {
    return (
      <div className="App">
        <HeaderComponent/>
        <MapComponent/>
      </div>
    );
  }
}

export default App;
