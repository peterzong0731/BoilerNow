import React, { useState } from 'react';
import './CreateEventForm.css';
import axios from 'axios';

function CreateEventForm() {
  const userStr = localStorage.getItem('user');
  var userId;
  
  if (userStr) {
      const userObj = JSON.parse(userStr);
      userId = userObj._id;
  } else {
      console.log("User not found in localStorage.");
  }

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    category: 'Academic',
    location: '',
    capacity: 0,
    status: 'Public',
    createdBy: userId
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/events/create', eventData);
      console.log('Successfully created the event', response.data);
    } catch (error) {
      console.error('Error during event creation', error);
    }
  };

  return (
    <div className="create-event-form-container">
      <h1>Create Event</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Event Title
          <input
            type="text"
            name="title"
            value={eventData.title}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            value={eventData.description}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Start Date
          <input
            type="datetime-local"
            name="startDate"
            value={eventData.startDate}
            onChange={handleInputChange}
          />
        </label>
        <label>
          End Date
          <input
            type="datetime-local"
            name="endDate"
            value={eventData.endDate}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Location
          <input
            type="text"
            name="location"
            value={eventData.location}
            onChange={handleInputChange}
          />
        </label>
        <div className='last-row-container'>
          <div className='category-container'>
            Category
            <label>
              <input
                type="radio"
                name="category"
                value="Academic"
                checked={eventData.category === 'Academic'}
                onChange={handleInputChange}
              />
              Academic
            </label>
            <label>
              <input
                type="radio"
                name="category"
                value="Social"
                checked={eventData.category === 'Social'}
                onChange={handleInputChange}
              />
              Social
            </label>
            <label>
              <input
                type="radio"
                name="category"
                value="Other"
                checked={eventData.category === 'Other'}
                onChange={handleInputChange}
              />
              Other
            </label>
          </div>
          <div className='category-container'>
            Capacity
            <label>
              <input
                type="number"
                name="capacity"
                value={eventData.capacity}
                min="0"
                max="999999"
                onChange={handleInputChange}
              />
            </label>
          </div>
          <div className='category-container'>
            Status
            <label>
              <input
                type="radio"
                name="status"
                value="Public"
                checked={eventData.status === 'Public'}
                onChange={handleInputChange}
              />
              Public
            </label>
            <label>
              <input
                type="radio"
                name="status"
                value="Private"
                checked={eventData.status === 'Private'}
                onChange={handleInputChange}
              />
              Private
            </label>
          </div>
        </div>
        
        <button type="submit" className="submit-button">submit</button>
      </form>
    </div>
  );
}

export default CreateEventForm;
