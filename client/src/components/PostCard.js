import './PostCard.css';
import React from 'react';
import TestPfp from './images/ccfingergun.png'

function PostCard() {
  return (
    <div className="post-card-container">
        <img className="post-pfp" src={TestPfp}/>
        <div className="post-card-columns">
            <div className="post-card-column-1">
                <span className="post-card-title">Lorem Ipsum</span>
                <span className="post-card-content">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</span>
            </div>
            <div className="post-card-column-2">
                <span className="post-card-date">5 mins ago</span>
                <div className="post-card-icons">
                    <span className="post-card-heart">&#x2764;</span>
                    <span className="post-card-comment-bubble">&#x1f5e9;</span>
                </div>
            </div>
        </div>
    </div>
  );
}

export default PostCard;