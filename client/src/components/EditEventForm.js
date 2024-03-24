import React, { useEffect, useState } from 'react';
import './CreateEventForm.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function EditEventForm() {
  const { id } = useParams();
  const userId = localStorage.getItem('user');

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    eventStartDatetime: '',
    eventEndDatetime: '',
    category: '',
    location: '',
    capacity: 0,
    status: '',
    ageRequirement: 0,
    createdBy: userId
  });

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await axios.get(`http://localhost:8000/events/${id}`);
        console.log(response.data)
        let { _id, category, createdDatetime, description, eventStartDatetime, eventEndDatetime, title, location, capacity, status, ageRequirement, createdByUser } = response.data;
       
        const convertUTCtoLocal = (datetime) => {
          let dateObj = new Date(datetime);
          dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
          dateObj = dateObj.toISOString().slice(0, 16);
          return dateObj;
        }

        eventStartDatetime = convertUTCtoLocal(eventStartDatetime);
        eventEndDatetime = convertUTCtoLocal(eventEndDatetime);
        
        console.log(response.data)
        setEventData({
            ...eventData,
            title: title,
            description,
            eventStartDatetime,
            eventEndDatetime,
            category,
            location,
            capacity,
            status,
            ageRequirement,
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
      window.alert('Event updated successfully!');
      window.location.href = `/event/${id}`;
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
          age requirement
          <input
            type="text"
            name="ageRequirement"
            value={eventData.ageRequirement}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Start Date
          <input
            type="datetime-local"
            name="eventStartDatetime"
            value={eventData.eventStartDatetime}
            onChange={handleInputChange}
          />
        </label>
        <label>
          End Date
          <input
            type="datetime-local"
            name="endDate"
            value={eventData.eventEndDatetime}
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
                value="public"
                checked={eventData.status === 'public'}
                onChange={handleInputChange}
              />
              Public
            </label>
            <label>
              <input
                type="radio"
                name="status"
                value="private"
                checked={eventData.status === 'private'}
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
