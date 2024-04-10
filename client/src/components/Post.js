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
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentContent, setCommentContent] = useState('');

  const currentUserFromStorage = localStorage.getItem('user');
  const currentUser = currentUserFromStorage ? localStorage.getItem('user') : null;
  const [purdueEmail, setPurdueEmail] = useState(false);
  const [event, setEvent] = useState();
  const [eventName, setEventName] = useState("Event");
  const [orgName, setOrgName] = useState("Org");
  const [postCreator, setPostCreator] = useState("");
  const navigate = useNavigate();

  async function fetchPost() {
    try {
      const response = await axios.get(`http://localhost:8000/posts/post/${id}`);
      const { postId, title, content, eventId, likedBy, replies, name } = response.data;

      setPostId(postId);
      setTitle(title);
      setContent(content);
      setEventId(eventId);
      setLikedBy(likedBy);
      setReplies(replies);
      setPostCreator(name)
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
        const { postId, title, content, eventId, likedBy, replies, name } = response.data;

        setPostId(postId);
        setTitle(title);
        setContent(content);
        setEventId(eventId);
        setLikedBy(likedBy);
        setReplies(replies);
        setPostCreator(name)
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
      if (isLiked) {
        const updatedLikedBy = likedBy.filter(userId => userId !== currentUser);
        setLikedBy(updatedLikedBy);
        await axios.patch(`http://localhost:8000/posts/like/${postId}/${currentUser}`);
      } else {
        const updatedLikedBy = [...likedBy, currentUser];
        setLikedBy(updatedLikedBy);
        await axios.patch(`http://localhost:8000/posts/like/${postId}/${currentUser}`);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error(error);
    }
  };

  const calculateHoursAgo = (postedDatetime) => {
    const postedTime = new Date(postedDatetime);
    const currentTime = new Date();
    const timeDifference = Math.abs(currentTime - postedTime);
    const hoursAgo = Math.floor(timeDifference / (1000 * 60 * 60));
    return hoursAgo;
  };

  const handleComment = async () => {
    try {
      const response = await axios.patch(`http://localhost:8000/posts/comment/${postId}/${currentUser}`, {
        content: commentContent
      });
      console.log(response.data);
      setShowCommentInput(false);
      setCommentContent('');

      fetchPost();
      } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteComment = async (postId, replyId) => {
    try {
      const response = await axios.patch(`http://localhost:8000/posts/uncomment/${postId}/${replyId}`);
      console.log(response.data);

      fetchPost();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="post-page-container">
      <h1 className="event-title">{title}</h1>
      <h2 className="event-organizer">by {postCreator} | {orgName}</h2>
      <p className="event-description"> {content} </p>
      <Link className="event-link" key={eventId} to={`/event/${eventId}`}>
        <div className="posts-event">{'\u{1F4C5}'} {eventName}</div>
      </Link>
      <div className={replies.length > 0 ? 'post-icon-row-border': 'post-icon-row'}>
        <div className='post-icon-row-container'>
          <p className="post-comment" onClick={() => setShowCommentInput(!showCommentInput)}> &#x1F4AC; {replies.length} </p>
          <p className={isLiked ? "post-liked" : "post-not-liked"} onClick={handleLike}> &#x2764; {likedBy.length} </p>
        </div>
        <div className='make-reply-container'>
          {showCommentInput && (
            <div>
              <input
                type="text"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Enter your reply"
              />
              <button onClick={handleComment}>Submit</button>
            </div>
          )}
        </div>
      </div>
      <div className="replies-container">
        {replies.map((reply, index) => (
          <div key={index} className="reply">
            <div className='reply-top-row'>
              <p className="reply-author">{reply.authorName}</p>
              <p className="reply-time">{calculateHoursAgo(reply.postedDatetime)} hours ago</p>
            </div>
            <p className="reply-content">{reply.content}</p>
            {reply.authorId === currentUser && (
              <button onClick={() => handleDeleteComment(postId, reply.replyId)}>Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Post;
