import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Posts from './components/Posts';
import Events from './components/Events';
import Navbar from './components/Navbar';
import CreateEventForm from './components/CreateEventForm';
import CreatePostForm from './components/CreatePostForm';
import Event from './components/Event';

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Posts />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/create-post" element={<CreatePostForm />} />
        <Route path="/events" element={<Events />} />
        <Route path="/create-event" element={<CreateEventForm />} />
        <Route path="/event" element={<Event />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
