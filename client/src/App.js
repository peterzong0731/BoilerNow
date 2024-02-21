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
import Profile from './components/Profile';
import EditEventForm from './components/EditEventForm';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword'

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
        <Route exact path="/edit-event/:id" element={<EditEventForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:email/:token" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
