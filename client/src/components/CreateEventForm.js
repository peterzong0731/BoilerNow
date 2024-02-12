import React, { useState } from 'react';
import './CreateEventForm.css';

function CreateEventForm() {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    category: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(eventData);
    // TODO: send eventData to backend
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

        <div className='category-container'>
          category
          <label>
            <input
              type="radio"
              name="category"
              value="academic"
              checked={eventData.category === 'academic'}
              onChange={handleInputChange}
            />
            academic
          </label>
          <label>
            <input
              type="radio"
              name="category"
              value="social"
              checked={eventData.category === 'social'}
              onChange={handleInputChange}
            />
            social
          </label>
          <label>
            <input
              type="radio"
              name="category"
              value="other"
              checked={eventData.category === 'other'}
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
