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
        const { _id, category, createdDatetime, description, eventStartDatetime, eventEndDatetime, name, location, capacityLimit, visibility, createdByUser } = response.data;
       
        const convertUTCtoLocal = (datetime) => {
          let dateObj = new Date(datetime);
          dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
          dateObj = dateObj.toISOString().slice(0, 16);
          return dateObj;
        }

        let startDatetime = convertUTCtoLocal(eventStartDatetime);
        let endDatetime = convertUTCtoLocal(eventEndDatetime);
        
        console.log(response.data)
        setEventData({
            ...eventData,
            title: name,
            description,
            startDate: startDatetime,
            endDate: endDatetime,
            category,
            location,
            capacity: capacityLimit,
            status: visibility.type,
            createdBy: createdByUser
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
                min="0"
                max="999999"
                value={eventData.capacity}
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

export default EditEventForm;
