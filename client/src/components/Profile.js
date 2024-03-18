import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { signOut } from './authUtils';
import './Profile.css'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import checkmark from './images/yellow_checkmark.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faEye, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

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
    const [dropdownVisible, setDropdownVisible] = useState({});

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

    const handleDeleteEvent = (eventId) => {
        Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              const response = await axios.delete(`http://localhost:8000/events/delete/${eventId}`);
              Swal.fire('Deleted!', 'Your event has been deleted.', 'success');
              console.log('Event deleted successfully:', response.data);
            } catch (error) {
              Swal.fire('Error!', 'There was a problem deleting your event.', 'error');
              console.error('Error deleting event:', error);
            }
          }
        });
    };

    const handleDeletePost = (postId) => {      
        Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              const response = await axios.delete(`http://localhost:8000/posts/delete/${userId}/${postId}`);
              Swal.fire('Deleted!', 'Your post has been deleted.', 'success');
              console.log('Post deleted successfully:', response.data);
            } catch (error) {
              Swal.fire('Error!', 'There was a problem deleting your post.', 'error');
              console.error('Error deleting post:', error);
            }
          }
        });
      };
    
    const toggleDropdown = (eventId) => {
        setDropdownVisible(prevState => ({
          ...prevState,
          [eventId]: !prevState[eventId]
        }));
    };

    const { name, bio, emailNotifs, createdDatetime, followingOrgs, prevInterestedEvents, posts } = user;

    return (
        <div className="profile">
            <div className='profile-name-container'>
                <h1>{name}</h1>
                {purdueEmail ? (<img className="verified-checkmark" src={checkmark} />)  : <></>}  
            </div>
            <div className='hosted-events'>
                <h1>Hosted Events:</h1>
                {userEvents ? (
                    userEvents.map(event => (
                        <div className='hosted-event'>
                            <p>{event.title}</p>
                            <div className='attendants'>
                                <button onClick={() => toggleDropdown(event._id)}>
                                    Users attending: {event.usersInterested.length}
                                </button>
                                <div className={`dropdown ${dropdownVisible[event._id] ? 'show' : ''}`}>
                                    {event.usersInterested.map(userInterested => (
                                        <p key={userInterested._id}>{userInterested.name}</p>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Link to={`/event/${event._id}`} style={{ marginRight: '10px' }}>       
                                    <FontAwesomeIcon className='fa-eye' icon={faEye} />
                                </Link>
                                <Link to={`/edit-event/${event._id}`} style={{ marginRight: '10px' }}>       
                                    <FontAwesomeIcon className='fa-edit' icon={faEdit} />
                                </Link>
                                <FontAwesomeIcon className='fa-delete' icon={faTrashAlt} onClick={() => handleDeleteEvent(event._id)}/>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No events hosted.</p>
                )}
            </div>
            <div className='hosted-events'>
                <h1>Your Posts:</h1>
                {console.log(userPosts)}
                {userPosts ? (
                    userPosts.map(post => (
                        <div className='hosted-event'>
                            <p>{post.title}</p>
                            <FontAwesomeIcon className='fa-delete' icon={faTrashAlt} onClick={() => handleDeletePost(post.postId)}/>
                        </div>
                    ))
                ) : (
                    <p>No posts created.</p>
                )}
            </div>
            <div className='profile-button-container'>
                <Link to={`/create-event`} className='profile-page-button'>Create Event</Link>
                <Link to={`/create-post`} className='profile-page-button'>Create Post</Link>
                <Link to={`/create-org`} className='profile-page-button'>Create Org</Link>
            </div>
            <div className='profile-sign-out' onClick={() => handleSignOut()}>Sign Out</div>
        </div>
    )
}

export default Profile
