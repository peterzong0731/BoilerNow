import React from 'react'
import PostCard from './PostCard'
import './Posts.css'

function Posts() {
  return (
    <div className="posts-outer-container">
      <div className="posts-inner-container">
        <PostCard />
        <PostCard />
      </div>
    </div>
  )
}

export default Posts
