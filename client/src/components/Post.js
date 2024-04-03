import React, { useState, useEffect } from 'react'
import './Event.css'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom';
import checkmark from './images/yellow_checkmark.png'

function Post() {
  const { id } = useParams();
  const [postId, setPostId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [eventId, setEventId] = useState('');
  const [likedBy, setLikedBy] = useState([]);
  const [replies, setReplies] = useState([]);

  const currentUserFromStorage = localStorage.getItem('user');
  const currentUser = currentUserFromStorage ? localStorage.getItem('user') : null;
  const [purdueEmail, setPurdueEmail] = useState(false)
  const [event, setEvent] = useState()
  const [eventName, setEventName] = useState("Event")
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await axios.get(`http://localhost:8000/posts/post/${id}`);
        console.log(response.data)
        const { postId, title, content, eventId, likedBy } = response.data;

        setPostId(postId)
        setTitle(title)
        setContent(content)
        setEventId(eventId)
        setLikedBy(likedBy)
        setReplies(replies)

        const eventResponse = await axios.get(`http://localhost:8000/events/${eventId}`);
        console.log(eventResponse)
        setEvent(eventResponse.data)
        setEventName(eventResponse.data.title)
      } catch (error) {
        console.error(error);
      }
    }
    fetchPost();
  }, [id]);


  return (
    <div className="event-container">
      <h1 className="event-title">{title}</h1>
      <p className="event-description"> {content} </p>
    </div>
  )
}

export default Post