import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Posts from './components/Posts';
import Events from './components/Events';
import Navbar from './components/Navbar';
import CreateEventForm from './components/CreateEventForm';
import CreatePostForm from './components/CreatePostForm';
import Event from './components/Event';
import Login from './components/Login';
import SignUp from './components/SignUp'

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
        <Route exact path="/event/:id" element={<Event />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
