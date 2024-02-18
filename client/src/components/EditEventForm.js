import React, { useEffect, useState } from 'react';
import './CreateEventForm.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function EditEventForm() {
  const { id } = useParams();
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
    category: '',
    location: '',
    capacity: 0,
    status: '',
    createdBy: userId
  });

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await axios.get(`http://localhost:8000/events/${id}`);
        const { _id, category, createdDateTime, description, endDate, startDate, title, location, capacity, status, createdBy } = response.data;
        console.log(response.data)
        setEventData({
            ...eventData,
            title,
            description,
            startDate: startDate,
            endDate: endDate,
            category,
            location,
            capacity,
            status,
            createdBy
        });
      } catch (error) {
        console.error(error);
      }
    }
    fetchEvent();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(`http://localhost:8000/events/update/${id}`, eventData);
      console.log('Successfully updated the event', response.data);
    } catch (error) {
      console.error('Error during event update', error);
    }
  };

  return (
    <div className="create-event-form-container">
      <h1>Edit Event</h1>
      <form onSubmit={handleSubmit}>
        <label>
          event title
          <input
            type="text"
            name="title"
            value={eventData.title}
            onChange={handleInputChange}
          />
        </label>
        <label>
          description
          <textarea
            name="description"
            value={eventData.description}
            onChange={handleInputChange}
          />
        </label>
        <label>
          start date
          <input
            type="datetime-local"
            name="startDate"
            value={eventData.startDate}
            onChange={handleInputChange}
          />
        </label>
        <label>
          end date
          <input
            type="datetime-local"
            name="endDate"
            value={eventData.endDate}
            onChange={handleInputChange}
          />
        </label>
        <label>
          location
          <input
            type="text"
            name="location"
            value={eventData.location}
            onChange={handleInputChange}
          />
        </label>
        <div className='last-row-container'>
          <div className='category-container'>
            category
            <label>
              <input
                type="radio"
                name="category"
                value="Academic"
                checked={eventData.category === 'Academic'}
                onChange={handleInputChange}
              />
              academic
            </label>
            <label>
              <input
                type="radio"
                name="category"
                value="Social"
                checked={eventData.category === 'Social'}
                onChange={handleInputChange}
              />
              social
            </label>
            <label>
              <input
                type="radio"
                name="category"
                value="Other"
                checked={eventData.category === 'Other'}
                onChange={handleInputChange}
              />
              other
            </label>
          </div>
          <div className='category-container'>
            capacity
            <label>
              <input
                type="number"
                name="capacity"
                value={eventData.capacity}
                onChange={handleInputChange}
              />
            </label>
          </div>
          <div className='category-container'>
            status
            <label>
              <input
                type="radio"
                name="status"
                value="public"
                checked={eventData.status === 'public'}
                onChange={handleInputChange}
              />
              public
            </label>
            <label>
              <input
                type="radio"
                name="status"
                value="private"
                checked={eventData.status === 'private'}
                onChange={handleInputChange}
              />
              private
            </label>
          </div>
        </div>
        
        <button type="submit" className="submit-button">submit</button>
      </form>
    </div>
  );
}

export default EditEventForm;
