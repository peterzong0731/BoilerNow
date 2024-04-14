import React, { useEffect, useState } from 'react';
import './EditUserForm.css';
import axios from 'axios';


function EditUserForm() {
    const userId = localStorage.getItem('user');
    const [formData, setFormData] = useState({
        name: '',
        age: 0
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }
    

    const handleSubmit = async(e) => {
        e.preventDefault();
        
        try {
          const response = await axios.patch(`http://localhost:8000/edit/${userId}`, formData);

          console.log('Successfully edited the user!', response.data);

          window.location.href = `/profile`;

        } catch (error) {
          console.error('Error during user update', error);
        }
      };

    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await axios.get(`http://localhost:8000/user/${userId}`);
                setFormData({name: response.data.name, age: response.data.age})
            } catch (error) {
                console.error(error);
            }
        }
        fetchUserData();
    }, []);
    

    return (
        <div className="edit-user-container">
          <h1>Edit User</h1>
          <form onSubmit={handleSubmit}>
            <label>
                Name
                <input type="text" name="name" value={formData.name} onChange={handleInputChange}></input>
            </label>
            <label>
                Age
                <input type="number" name="age" value={formData.age} onChange={handleInputChange}></input>
            </label>
            <button type="submit" className="submit-button">submit</button>
          </form>
        </div>
    )
}

export default EditUserForm;