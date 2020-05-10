import React from 'react';
import logo from './logo.svg';
import './App.css';
import MainPage from './pages/MainPage';

function App() {
  // @ts-ignore
  const ethereum = window.ethereum;

  return (
    <div className="App">
      <header className="App-header">
        <MainPage ethereum={ethereum}/>
      </header>
    </div>
  );
}

export default App;
