import React, { useState } from 'react';
import './CreateEventForm.css';

function CreatePostForm() {
  const [postData, setPostData] = useState({
    title: '',
    description: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostData({ ...postData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(postData);
    // TODO: send postData to backend
  };

  return (
    <div className="create-event-form-container">
      <h1>Create Post</h1>
      <form onSubmit={handleSubmit}>
        <label>
          select event
          <input
            type="text"
            name="title"
            value={postData.title}
            onChange={handleInputChange}
          />
        </label>
        <label>
          description
          <textarea
            name="description"
            value={postData.description}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit" className="submit-button">post</button>
      </form>
    </div>
  );
}

export default CreatePostForm;
