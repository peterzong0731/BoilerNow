import React, { useState, useEffect } from 'react'
import './Event.css'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom';
import checkmark from './images/yellow_checkmark.png'
import { Toaster, toast } from 'sonner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';

function Event() {
  const { id } = useParams();
  const [category, setCategory] = useState('')
  const [createdDatetime, setCreatedDatetime] = useState('')
  const [description, setDescription] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [capacity, setCapacity] = useState(0)
  const [ageRequirement, setAgeRequirement] = useState(0);
  const [status, setStatus] = useState('')
  const [userAge, setUserAge] = useState(0);
  const [usersInterested, setUsersInterested] = useState([])
  const [eventCreatedByUser, setEventCreatedByUser] = useState({})
  const [hasJoined, setHasJoined] = useState(false);
  const [images, setImages] = useState([]);
  const [showShareBox, setShowShareBox] = useState(false);
  const [shareEmail, setShareEmail] = useState('');

  const currentUserFromStorage = localStorage.getItem('user');
  const currentUser = currentUserFromStorage ? localStorage.getItem('user') : null;
  const [purdueEmail, setPurdueEmail] = useState(false)
  const [org, setOrg] = useState()
  const [orgName, setOrgName] = useState("Org")
  const navigate = useNavigate();

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
    async function fetchUser() {
      try {
        var userId = localStorage.getItem('user');
        const userResponse = await axios.get(`http://localhost:8000/user/${userId}`);
        setUserAge(userResponse.data.age);
      } catch (error) {
        console.log(error);
      }
    }
    async function fetchEvent() {
      try {
          const response = await axios.get(`http://localhost:8000/events/${id}`);
          console.log(response.data)
          const { _id, title, description, category, location, ageRequirement, eventStartDatetime, eventEndDatetime, 
          capacity, usersInterested, status, belongsToOrg, createdBy, createdDatetime, comments, images} = response.data;

          const userOfEvent = await axios.get(`http://localhost:8000/user/${createdBy}`);

          setEventCreatedByUser(userOfEvent.data)
          setCategory(category)
          setCreatedDatetime(createdDatetime)
          setDescription(description)
          setDateRange(formatDateRange(eventStartDatetime, eventEndDatetime))
          setTitle(title)
          setLocation(location)
          setAgeRequirement(ageRequirement)
          setCapacity(capacity)
          setStatus(status)
          setUsersInterested(usersInterested)
          setImages(images.map(image => `http://localhost:8000/${image}`));
          
          if (userOfEvent.data.login.email.includes('purdue.edu')) setPurdueEmail(true)

          console.log(usersInterested)
          const isInterested = usersInterested.some(user => user.userId === currentUser);
          setHasJoined(isInterested);

          const orgResponse = await axios.get(`http://localhost:8000/orgs/${belongsToOrg}`);
          console.log(orgResponse)
          setOrg(orgResponse.data)
          setOrgName(orgResponse.data.name)

      } catch (error) {
        console.error(error);
      }
    }
    fetchUser();
    fetchEvent();
  }, [id]);

  const handleJoin = async () => {
    try {
      console.log(id + " ", currentUser)
        const response = await axios.patch(`http://localhost:8000/events/follow/${id}/${currentUser}`);
        
        setUsersInterested(prevUsers => [...prevUsers, currentUser]);
        console.log(usersInterested)
        setHasJoined(true); 
        
        toast.success("Successfully joined event!")
    } catch (error) {
        toast.error('Error joining event.');
    }
  }

  const handleUnregister = async () => {  
    try {
        const response = await axios.patch(`http://localhost:8000/events/unfollow/${id}/${currentUser}`);
        
        setUsersInterested(prevUsers => prevUsers.filter(userId => userId !== currentUser));
        setHasJoined(false);
        
        toast.success("Successfully unregistered from event.");
    } catch (error) {
        toast.error('Error unregistering from event.');
    }
  };

  const isNewEvent = (createdDatetime) => {
    const now = new Date();
    const createdDate = new Date(createdDatetime);
    const diff = now - createdDate;
    const hours = diff / (1000 * 60 * 60);
    return hours <= 24;
  };

  const handleShareClick = () => {
    setShowShareBox(!showShareBox);
  };

  const handleShare = async () => {
    try {
      const url = `http://localhost:8000/shareEvent/${currentUser}/${id}`;
      
      await axios.post(url, { email: shareEmail });

      console.log(`Email sent to: ${shareEmail}`);
      toast.success("Event shared successfully!");
      
      setShareEmail('');
      setShowShareBox(false);
    } catch (error) {
      console.error('Error sharing event:', error);
      toast.error("Failed to share the event.");
    }
  };

  const handleAnalyticsClick = () => {
    navigate(`/event-analytics/${id}`);
  }

  return (
    <div className="event-container">
      <Toaster richColors position="top-center"/>
      <h1 className="event-title">{title}</h1>
      <div className={`event-category ${category}`}>
        {category}
        {isNewEvent(createdDatetime) && (
          <span className="emoji-tooltip-container">
            🔥
            <span className="emoji-tooltip-text">New event</span>
          </span>
        )}
      </div>
      <h2 className="event-organizer">by {eventCreatedByUser.name} {purdueEmail ? (<img className="verified-checkmark-event" src={checkmark} alt='Test'/>)  : <></>} | {orgName}</h2>
      {capacity !== '0' && (
        <div className={`event-capacity ${category}`}>Available: {capacity - usersInterested.length} / {capacity}</div>
      )}
        <div className={`event-capacity ${category}`}>Age requirement: {ageRequirement}</div>
      {currentUser ? (
        hasJoined ? (
          <>
            <button className="event-join-button-disabled" disabled>Joined</button>
            <button className="event-unregister-button" onClick={handleUnregister}>Unregister</button>
          </>
        ) : (
          (userAge >= ageRequirement) ? (
            <button className="event-join-button" onClick={handleJoin}>Join</button>
          ) : (
            <button className="event-join-button-disabled" disabled>Not old enough</button>
          )
        )
      ) : (
        <button className="event-join-button-disabled" disabled>Log in to join</button>
      )}
      {currentUser ? (
        <>
          <button className="event-share-button" onClick={handleShareClick}>Share</button>
          {showShareBox && (
            <div className="share-box">
              <input 
                type="email" 
                value={shareEmail} 
                onChange={(e) => setShareEmail(e.target.value)} 
                placeholder="Enter email to share" 
              />
              <button className="share-box-button" onClick={handleShare}>Send</button>
            </div>
          )}
        </>
      ) : (
        <button className="event-join-button-disabled" disabled>Log in to share</button>
      )}
      <button className="event-data-button" onClick={handleAnalyticsClick}><FontAwesomeIcon icon={faChartBar} /></button>
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