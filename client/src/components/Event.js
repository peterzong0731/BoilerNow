import React, { useState, useEffect } from 'react'
import './Event.css'
import axios from 'axios'
import { useParams } from 'react-router-dom';
import { getUserInfo } from './authUtils';
import checkmark from './images/yellow_checkmark.png'

function Event() {
  const { id } = useParams();
  const [category, setCategory] = useState('')
  const [createdDatetime, setCreatedDatetime] = useState('')
  const [description, setDescription] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [capacity, setCapacity] = useState(0)
  const [status, setStatus] = useState('')
  const [usersInterested, setUsersInterested] = useState([])
  const [eventCreatedByUser, setEventCreatedByUser] = useState({})
  const [hasJoined, setHasJoined] = useState(false);
  const currentUserFromStorage = localStorage.getItem('user');
  const currentUser = currentUserFromStorage ? JSON.parse(currentUserFromStorage) : null;
  const [purdueEmail, setPurdueEmail] = useState(false)
  const [images, setImages] = useState([]);

  function formatDateRange(startDateStr, endDateStr) {
    const options = { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
  
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
  
    const startFormatted = startDate.toLocaleString('en-US', options);
    const endFormatted = endDate.toLocaleString('en-US', options);
  
    const startFinal = `${startFormatted.split(', ')[0]} - ${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`;
    const endFinal = `${endFormatted.split(', ')[0]} - ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`;
  
    return `${startFinal} to ${endFinal}`;
  }

  useEffect(() => {
    async function fetchEvent() {
      try {
          const response = await axios.get(`http://localhost:8000/events/${id}`);
          console.log(response.data)
          const { _id, title, description, category, location, eventStartDatetime, eventEndDatetime, 
          capacity, usersInterested, status, belongsToOrg, createdBy, createdDatetime, images } = response.data;

          const userOfEvent = await axios.get(`http://localhost:8000/user/${createdBy}`);

          setEventCreatedByUser(userOfEvent.data)
          setCategory(category)
          setCreatedDatetime(createdDatetime)
          setDescription(description)
          setDateRange(formatDateRange(eventStartDatetime, eventEndDatetime))
          setTitle(title)
          setLocation(location)
          setCapacity(capacity)
          setStatus(status)
          setUsersInterested(usersInterested)
          setImages(images.map(image => `http://localhost:8000/${image}`));
          
          if (userOfEvent.data.login.email.includes('purdue.edu')) setPurdueEmail(true)

          console.log(usersInterested)
          const isInterested = usersInterested.includes(currentUser._id);
          setHasJoined(isInterested);

      } catch (error) {
        console.error(error);
      }
    }
    fetchEvent();
  }, [id]);

  const handleJoin = async () => {
    try {
        const response = await axios.patch(`http://localhost:8000/events/join/${id}/${currentUser._id}`);
        
        setUsersInterested(prevUsers => [...prevUsers, currentUser._id]);
        setHasJoined(true); 
        
        console.log("Successfully joined")
    } catch (error) {
        console.error('Error joining event:', error);
    }
  }

  const handleUnregister = async () => {  
    try {
        const response = await axios.patch(`http://localhost:8000/events/unregister/${id}/${currentUser._id}`);
        
        setUsersInterested(prevUsers => prevUsers.filter(userId => userId !== currentUser._id));
        setHasJoined(false);
        
        console.log("Successfully unregistered");
    } catch (error) {
        console.error('Error unregistering from event:', error);
    }
  };

  return (
    <div className="event-container">
      <h1 className="event-title">{title}</h1>
      <div className={`event-category ${category}`}>{category}</div>
      <h2 className="event-organizer">by {eventCreatedByUser.name} {purdueEmail ? (<img className="verified-checkmark-event" src={checkmark} alt='Test'/>)  : <></>} | Club</h2>
      {capacity !== '0' && (
        <div className={`event-capacity ${category}`}>Available: {capacity - usersInterested.length} / {capacity}</div>
      )}
      {currentUser ? (
        hasJoined ? (
          <>
            <button className="event-join-button-disabled" disabled>Joined</button>
            <button className="event-unregister-button" onClick={handleUnregister}>Unregister</button>
          </>
        ) : (
          <button className="event-join-button" onClick={handleJoin}>Join</button>
        )
      ) : (
        <button className="event-join-button-disabled" disabled>Log in to join</button>
      )}
      <div className="event-dates">
        <div className="event-date">{'\u{1F4C5}'} {dateRange}</div>
      </div>
      <div className="event-location">{'\u{1F4CD}'} {location}</div>
      <h2 className="event-description-title">Description:</h2>
      <p className="event-description"> {description} </p>
      <div className="event-images">
        {images.map((image, index) => (
          <img key={index} src={image} alt={`Event Image ${index + 1}`} className="event-image" />
        ))}
      </div>
    </div>
  )
}

export default Event