import './Navbar.css';
import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <p><a href='/'>BoilerNow</a></p>
      <ul>
        <li><a href="/posts">Posts</a></li>
        <li><a href="/events">Events</a></li>
      </ul>
      <div className='nav-buttons'>
        <Link to="/login"><button className="login" text="Login">Login</button></Link>
      </div>
    </nav>
  );
}

export default Navbar;