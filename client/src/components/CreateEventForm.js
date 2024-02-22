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
    eventStartDatetime: '',
    eventEndDatetime: '',
    category: '',
    location: '',
    capacity: 0,
    status: '',
    createdBy: userId,
    usersInterested: [],
    usersInterestedNames: [],
    images: []
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setEventData({ ...eventData, images: [...files] });
    } else {
      setEventData({ ...eventData, [name]: value });
    }
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    setEventData({ ...eventData, images: [...eventData.images, ...files] });
  };

  const removeImage = (index) => {
    const newImages = [...eventData.images];
    newImages.splice(index, 1);
    setEventData({ ...eventData, images: newImages });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(eventData).forEach(key => {
      if (key === 'images') {
        [...eventData.images].forEach(file => {
          formData.append('images', file);
        });
      } else if (Array.isArray(eventData[key]) || typeof eventData[key] === 'object') {
        formData.append(key, JSON.stringify(eventData[key]));
      } else {
        formData.append(key, eventData[key]);
      }
    });
    try {
      const response = await axios.post('http://localhost:8000/events/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      window.alert('Event created successfully!');
      window.location.href = '/events';
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
            name="eventStartDatetime"
            value={eventData.eventStartDatetime}
            onChange={handleInputChange}
          />
        </label>
        <label>
          end date
          <input
            type="datetime-local"
            name="eventEndDatetime"
            value={eventData.eventEndDatetime}
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
        <label>
          Event Image
          <input
            type="file"
            name="images"
            onChange={handleInputChange}
            multiple
            accept="image/*"
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
        <label>
          Images:
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInputChange}
          />
        </label>
        <div>
          {eventData.images.map((image, index) => (
            <img
              key={index}
              src={URL.createObjectURL(image)}
              alt={`Preview ${index}`}
              className="image-preview"
              onClick={() => removeImage(index)}
            />
          ))}
        </div>
        <button type="submit" className="submit-button">submit</button>
      </form>
    </div>
  );
}

export default CreateEventForm;
