import React, { useState } from 'react';
import './CreateEventForm.css';
import axios from 'axios';
import { Toaster, toast } from 'sonner'

function CreateOrgForm() {
  const userId = localStorage.getItem('user');
  const userName = localStorage.getItem('name');

  const [orgData, setOrgData] = useState({
    createdBy: userId,
    name: '',
    shorthand: '',
    bio: '',
    email: '',
    twitter: '',
    discord: '',
    phoneNumber: ''
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
        setOrgData({ ...orgData, images: [...files] });
    } else {
        setOrgData({ ...orgData, [name]: value });
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:8000/orgs/create', orgData);
      toast.success('Org created successfully!', {
        action: {
          label: 'Undo',
          onClick: () => window.location.href = '/events'
        }
      })
      console.log('Successfully created the org!', response.data);
    } catch (error) {
      console.error('Error during org creation', error);
    }
  };

  return (
    <div className="create-event-form-container">
      <Toaster richColors position="top-center"/>
      <h1>Create Organization</h1>
      <form onSubmit={handleSubmit}>
        <label>
          organization name
          <input
            type="text"
            name="name"
            value={orgData.name}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          shorthand
          <input
            type="text"
            name="shorthand"
            value={orgData.shorthand}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          bio
          <textarea
            name="bio"
            value={orgData.bio}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          email
          <input
            type="text"
            name="email"
            value={orgData.email}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          twitter (optional)
          <input
            type="text"
            name="twitter"
            value={orgData.twitter}
            onChange={handleInputChange}
          />
        </label>
        <label>
          discord (optional)
          <input
            type="text"
            name="discord"
            value={orgData.discord}
            onChange={handleInputChange}
          />
        </label>
        <label>
          phone number (optional)
          <input
            type="text"
            name="phoneNumber"
            value={orgData.phoneNumber}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit" className="submit-button">submit</button>
      </form>
    </div>
  );
}

export default CreateOrgForm;
