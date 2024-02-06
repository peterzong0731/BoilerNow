import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Posts from './components/Posts';
import Events from './components/Events';
import Navbar from './components/Navbar';

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Posts />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/events" element={<Events />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
