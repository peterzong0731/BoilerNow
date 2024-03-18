import React, { useState, useEffect } from 'react';
import './CreateEventForm.css';
import axios from 'axios';
import { Toaster, toast } from 'sonner'

function CreatePostForm() {
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    eventId: ''
  });
  const [userEvents, setUserEvents] = useState([]);
  const currentUserFromStorage = localStorage.getItem('user');
  const currentUser = currentUserFromStorage ? localStorage.getItem('user') : null;
  
  useEffect(() => {
    async function fetchUserEvents() {
      try {
        const response = await axios.get(`http://localhost:8000/events/user-events/${currentUser}`);
        setUserEvents(response.data);
      } catch (error) {
        console.error('Error fetching user events:', error);
      }
    }
    fetchUserEvents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostData({ ...postData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:8000/posts/create/${currentUser}`, {
        title: postData.title,
        content: postData.content,
        eventId: postData.eventId
      });
      toast.success('Post created successfully!');
      window.location.href = '/posts';
    } catch (error) {
      toast.error('Error creating post.');
    }
  };

  return (
    <div className="create-event-form-container">
      <Toaster richColors position="top-center"/>
      <h1>Create Post</h1>
      <form onSubmit={handleSubmit}>
        <label>
          event
          <select
            name="eventId"
            value={postData.eventId}
            onChange={handleInputChange}
          >
            <option value="">Select an event</option>
            {userEvents.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          title
          <input
            type="text"
            name="title"
            value={postData.title}
            onChange={handleInputChange}
          />
        </label>
        <label>
          content
          <textarea
            name="content"
            value={postData.content}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit" className="submit-button">Post</button>
      </form>
    </div>
  );
}

export default CreatePostForm;
