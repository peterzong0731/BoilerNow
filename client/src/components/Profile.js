import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { signOut } from './authUtils';
import './Profile.css'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const navigate = useNavigate();
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
    const [userPosts, setUserPosts] = useState([])

    useEffect(() => {
        async function fetchUser() {
            try {
                const userResponse = await axios.get(`http://localhost:8000/user/${userId}`);
                setUser(userResponse.data);

                const eventsResponse = await axios.get(`http://localhost:8000/events/user-events/${userId}`);
                setUserEvents(eventsResponse.data);

                const postsResponse = await axios.get(`http://localhost:8000/posts/${userId}`);
                setUserPosts(postsResponse.data);
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
        navigate('/');
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            const response = await axios.delete(`http://localhost:8000/events/delete/${eventId}`);
            console.log('Event deleted successfully:', response.data);
          } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            const response = await axios.delete(`http://localhost:8000/posts/delete/${userId}/${postId}`);
            console.log('Post deleted successfully:', response.data);
          } catch (error) {
            console.error('Error deleting event:', error);
        }
    };
      
      

    const { name, bio, emailNotifs, createdDatetime, followingOrgs, prevInterestedEvents, posts } = user;

    return (
        <div className="profile">
            <h1>Profile: {name}</h1>
            <div className='hosted-events'>
                {userEvents ? (
                    userEvents.map(event => (
                        <div className='user-event-row'>
                            <div className='buttons' style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <Link to={`/event/${event._id}`} style={{ marginRight: '10px' }}>
                                    <div className={`event ${event.category}`} style={{ marginRight: '10px'}}>{event.title}</div>
                                </Link>
                                <Link to={`/edit-event/${event._id}`} style={{ marginRight: '10px' }}>
                                    <button>EDIT</button>
                                </Link>
                                <button onClick={() => handleDeleteEvent(event._id)}>Delete</button>
                            </div>
                            {<div className='attendants'>
                                {event.usersInterestedNames.length ? (
                                    <div>Users attending:</div>
                                ) :(<div></div>)}
                                {event.usersInterestedNames.map(name => (
                                    <p>{name}</p>
                                ))}
                                </div>}
                        </div>

                    ))
                ) : (
                    <p>No events hosted.</p>
                )}
            </div>
            <div className='hosted-events'>
                {userPosts ? (
                    userPosts.map(post => (
                        <div className='user-event-row'>
                            <div className='buttons' style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <div style={{ marginRight: '10px'}}>{post.title}</div>
                                <button onClick={() => handleDeletePost(post.postId)}>Delete</button>
                            </div>
                        </div>

                    ))
                ) : (
                    <p>No posts created.</p>
                )}
            </div>
            <Link to={`/create-event`}>Create Event</Link>
            <Link to={`/create-post`}>Create Post</Link>
            <button onClick={() => handleSignOut()}>Sign Out</button>
        </div>
    )
}

export default Profile
