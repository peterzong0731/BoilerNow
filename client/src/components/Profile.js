import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { signOut } from './authUtils';
import './Profile.css'
import { Link } from 'react-router-dom';

function Profile() {
    const userStr = localStorage.getItem('user');
    var userId;
    
    if (userStr) {
        const userObj = JSON.parse(userStr);
        userId = userObj._id;
    } else {
        console.log("User not found in localStorage.");
    }

    const [user, setUser] = useState(null);
    const [userEvents, setUserEvents] = useState([])

    useEffect(() => {
        async function fetchUser() {
            try {
                console.log(userId)
                const userResponse = await axios.get(`http://localhost:8000/user/${userId}`);
                setUser(userResponse.data);

                const eventsResponse = await axios.get(`http://localhost:8000/events/user-events/${userId}`);
                setUserEvents(eventsResponse.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        }
        if(userId) {
            fetchUser();
        }
    }, [userId]);

    if (!user) {
        return <div>Loading...</div>;
    }

    const handleSignOut = () => {
        signOut();
    };

    const handleDeleteEvent = async (eventId) => {
        console.log(eventId)
        try {
            const response = await axios.delete(`http://localhost:8000/events/delete/${eventId}`);
            console.log('Event deleted successfully:', response.data);
          } catch (error) {
            console.error('Error deleting event:', error);
        }
    };
      

    const { name, bio, emailNotifs, createdDateTime, followingOrgs, prevInterestedEvents, posts } = user;

    return (
        <div>
            <h1>Profile: {name}</h1>
            <div className='hosted-events'>
                {userEvents ? (
                    userEvents.map(event => (
                        <>
                            <Link key={event._id} to={`/event/${event._id}`}>
                                <div className={`event ${event.category}`}>{event.title}</div>
                            </Link>
                            <Link to={`/edit-event/${event._id}`}>
                                EDIT
                            </Link>
                            {console.log(event._id)}
                            <button onClick={() => handleDeleteEvent(event._id)}>Delete</button>
                        </>
                    ))
                ) : (
                    <p>No events hosted.</p>
                )}
            </div>
            <button onClick={() => handleSignOut}>sign out</button>
        </div>
    )
}

export default Profile
