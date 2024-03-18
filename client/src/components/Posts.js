import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from './PostCard';
import './Posts.css';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [sortedPosts, setSortedPosts] = useState([]);
  const [sortBy, setSortBy] = useState('time');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await axios.get('http://localhost:8000/posts');
        setPosts(response.data);
        setSortedPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    }
    fetchPosts();
  }, []);

  const sortByTime = () => {
    let sorted;
    if (sortOrder === 'asc') {
      sorted = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setSortOrder('desc');
    } else {
      sorted = [...posts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setSortOrder('asc');
    }
    setSortedPosts(sorted);
    setSortBy('time');
  };

  return (
    <div className="posts-outer-container">
      <div className="posts-sort-buttons">
        {/* <button onClick={sortByTime}>
          {sortOrder === 'asc' ? 'Sort by Newest' : 'Sort by Oldest'}
        </button> */}
      </div>
      <div className="posts-inner-container">
        {sortedPosts.map(post => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}

export default Posts;
