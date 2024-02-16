import React, { useState } from 'react';
import './CreateEventForm.css';
import axios from 'axios';

function CreateEventForm() {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    category: '',
    location: ''
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

        <button type="submit" className="submit-button">submit</button>
      </form>
    </div>
  );
}

export default CreateEventForm;
