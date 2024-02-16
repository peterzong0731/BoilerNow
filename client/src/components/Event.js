import React, { useState, useEffect } from 'react'
import './Event.css'
import axios from 'axios'
import { useParams } from 'react-router-dom';

function Event() {
  const { id } = useParams();
  const [category, setCategory] = useState('')
  const [createdDateTime, setCreatedDateTime] = useState('')
  const [description, setDescription] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [capacity, setCapacity] = useState(0)
  const [status, setStatus] = useState('')

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
        const { _id, category, createdDateTime, description, endDate, startDate, title, location, capacity, status } = response.data;
        console.log(response.data)
        setCategory(category)
        setCreatedDateTime(createdDateTime)
        setDescription(description)
        setDateRange(formatDateRange(startDate, endDate))
        console.log(dateRange)
        setTitle(title)
        setLocation(location)
        setCapacity(capacity)
        setStatus(status)
      } catch (error) {
        console.error(error);
      }
    }
    fetchEvent();
  }, [id]);

  return (
    <div className="event-container">
        <h1 className="event-title">{title}</h1>
        <div className={`event-category ${category}`}>{category}</div>
        <h2 className="event-organizer">by User | Club</h2>
        {capacity !== '0' && (
          <div className={`event-capacity ${category}`}>Capacity: {capacity}</div>
        )}
        <button className="event-join-button">Join</button>
        <div className="event-dates">
            <div className="event-date">{'\u{1F4C5}'} {dateRange}</div>
        </div>
        <div className="event-location">{'\u{1F4CD}'} {location}</div>
        <h2 className="event-description-title">Description:</h2>
        <p className="event-description"> {description} </p>
    </div>
  )
}

export default Event