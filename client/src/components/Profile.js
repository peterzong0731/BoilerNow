import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { signOut } from './authUtils';
import './Profile.css'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import checkmark from './images/yellow_checkmark.png'

function Profile() {
    const navigate = useNavigate();
    var userId;

    // Google sing in
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const userIdValue = urlParams.get('user');
        if (userIdValue) {
            userId = userIdValue;
            async function fetchUser() {
                try {
                    const userResponse = await axios.get(`http://localhost:8000/user/${userId}`);
                    console.log("Testing " + userResponse)
                    localStorage.setItem('user', JSON.stringify(userResponse.data));
                } catch (error) {
                    console.error('Error fetching profile:', error);
                }
            }
            fetchUser();
        } else {
            console.log("User ID not found in URL parameters.");
        }
    }, []);

    userId = localStorage.getItem('user');

    const [user, setUser] = useState(null);
    const [userEvents, setUserEvents] = useState([])
    const [userPosts, setUserPosts] = useState([])
    const [userOrgs, setUserOrgs] = useState([])
    const [purdueEmail, setPurdueEmail] = useState(false)

    useEffect(() => {
        async function fetchUser() {
            try {
                console.log(userId)

                const userResponse = await axios.get(`http://localhost:8000/user/${userId}`);
                setUser(userResponse.data);

                if (userResponse.data.login.email.includes('purdue.edu')) setPurdueEmail(true)

                const eventsResponse = await axios.get(`http://localhost:8000/events/user-events/${userId}`);
                console.log(eventsResponse.data)
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
            alert("Event deleted")
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
            <div className='profile-name-container'>
                <h1>{name}</h1>
                {purdueEmail ? (<img className="verified-checkmark" src={checkmark} />)  : <></>}  
            </div>
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
                                {event.usersInterested.length ? (
                                    <div>Users attending:</div>
                                ) :(<div></div>)}
                                {event.usersInterested.map(userInterested => (
                                    <p>{userInterested.name}</p>
                                ))}
                                </div>
                            }
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
            <Link to={`/create-org`}>Create Org</Link>
            <button onClick={() => handleSignOut()}>Sign Out</button>
        </div>
    )
}

export default Profile
