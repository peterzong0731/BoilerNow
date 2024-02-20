import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from './PostCard';
import './Posts.css';

function Posts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await axios.get('http://localhost:8000/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="posts-outer-container">
      <div className="posts-inner-container">
        {posts.map(post => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}

export default Posts;
