import React, { useState, useEffect } from 'react';
import './Event.css';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import checkmark from './images/yellow_checkmark.png';
import { Link } from 'react-router-dom';
import './Post.css';

function Post() {
  const { id } = useParams();
  const [postId, setPostId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [eventId, setEventId] = useState('');
  const [likedBy, setLikedBy] = useState([]);
  const [replies, setReplies] = useState([]);
  const [isLiked, setIsLiked] = useState(false);

  const currentUserFromStorage = localStorage.getItem('user');
  const currentUser = currentUserFromStorage ? localStorage.getItem('user') : null;
  const [purdueEmail, setPurdueEmail] = useState(false);
  const [event, setEvent] = useState();
  const [eventName, setEventName] = useState("Event");
  const [orgName, setOrgName] = useState("Org");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        var userId = localStorage.getItem('user');
        const userResponse = await axios.get(`http://localhost:8000/user/${userId}`);
      } catch (error) {
        console.log(error);
      }
    }

    async function fetchPost() {
      try {
        const response = await axios.get(`http://localhost:8000/posts/post/${id}`);
        const { postId, title, content, eventId, likedBy } = response.data;

        setPostId(postId);
        setTitle(title);
        setContent(content);
        setEventId(eventId);
        setLikedBy(likedBy);
        setReplies(replies);
        setIsLiked(likedBy.includes(currentUser));

        const eventResponse = await axios.get(`http://localhost:8000/events/${eventId}`);
        console.log(eventResponse);
        setEvent(eventResponse.data);
        setEventName(eventResponse.data.title);

        const orgResponse = await axios.get(`http://localhost:8000/orgs/${eventResponse.data.belongsToOrg}`);
        setOrgName(orgResponse.data.name);
      } catch (error) {
        console.error(error);
      }
    }
    
    fetchPost();
    fetchUser();
  }, [id]);

  const handleLike = async () => {
    try {
      const isLiked = likedBy.includes(currentUser);

      if (isLiked) {
        const updatedLikedBy = likedBy.filter(userId => userId !== currentUser);
        setLikedBy(updatedLikedBy);
        await axios.delete(`http://localhost:8000/posts/like/${postId}/${currentUser}`);
      } else {
        const updatedLikedBy = [...likedBy, currentUser];
        setLikedBy(updatedLikedBy);
        await axios.post(`http://localhost:8000/posts/like/${postId}/${currentUser}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="post-page-container">
      <h1 className="event-title">{title}</h1>
      <h2 className="event-organizer">by Post Creator | {orgName}</h2>
      <p className="event-description"> {content} </p>
      <Link className="event-link" key={eventId} to={`/event/${eventId}`}>
        <div className="posts-event">{'\u{1F4C5}'} {eventName}</div>
      </Link>
      <div className='post-icon-row'>
        <p className="post-comment"> &#x1F4AC; {replies.length} </p>
        <p className={isLiked ? "post-liked" : "post-not-liked"} onClick={handleLike}> &#x2764; {likedBy.length} </p>
      </div>
    </div>
  );
}

export default Post;
