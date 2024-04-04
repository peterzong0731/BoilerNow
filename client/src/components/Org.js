import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Org.css'
import { Toaster, toast } from 'sonner'
import PostCard from './PostCard';

function Org() {
  const { id } = useParams();
  const [orgData, setOrgData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [usersFollowed, setUsersFollowed] = useState([])
  const [hasFollowed, setHasFollowed] = useState(false);
  const [orgPosts, setOrgPosts] = useState([])
  const currentUserFromStorage = localStorage.getItem('user');
  const currentUser = currentUserFromStorage ? localStorage.getItem('user') : null;
  const [showReportBox, setShowReportBox] = useState(false);

  const fetchOrg = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/orgs/${id}`);

      const { followers } = response.data;
      console.log(response.data);
      setOrgData(response.data);
      setUsersFollowed(followers)

      const isFollowing = followers.some(user => user === currentUser);
      setHasFollowed(isFollowing);

      const postsResponse = await axios.get(`http://localhost:8000/posts/orgPosts/${id}`);
      console.log(postsResponse.data)
      setOrgPosts(postsResponse.data)

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrg();
  }, [id]);

  const handleOrgImgClick = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`http://localhost:8000/upload/orgImg/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("Org Image added successfully", response.data);
      // Fetch the updated organization data again
      fetchOrg();
    } catch (error) {
      console.error("Error adding Org Image:", error);
    }
  };

  const handleBannerImgClick = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`http://localhost:8000/upload/bannerImg/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("Banner Image added successfully", response.data);
      // Fetch the updated organization data again
      fetchOrg();
    } catch (error) {
      console.error("Error adding Banner Image:", error);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await axios.patch(`http://localhost:8000/orgs/follow/${id}/${currentUser}`);
      console.log(response.data)

      setUsersFollowed(prevUsers => [...prevUsers, currentUser]);
      setHasFollowed(true);

      toast.success("Successfully followed org!")
    } catch (error) {
      toast.error('Error following org.');
    }
  }

  const handleUnfollow = async () => {
    try {
      const response = await axios.patch(`http://localhost:8000/orgs/unfollow/${id}/${currentUser}`);

      setUsersFollowed(prevUsers => prevUsers.filter(userId => userId !== currentUser));
      setHasFollowed(false);

      toast.success("Successfully unfollowed org.");
    } catch (error) {
      toast.error('Error unregistering from event.');
    }
  };

  const handleReport = () => {
    setShowReportBox(!showReportBox);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='org-page-outer-container'>
      {orgData.bannerImg && <img src={orgData.bannerImg} alt="Banner Image" className='org-banner' />}
      <div className='org-page-inner-container'>
        <div className='org-images'>
          {orgData.orgImg && <img src={orgData.orgImg} alt="Organization Image" id='org-pfp' />}
        </div>
        <div className='org-text-container'>
          <div className='org-text'>
            <span id='org-name'>{orgData.name}</span>
            <span id='org-bio'>{orgData.bio}</span>
          </div>
          <div>
            {currentUser ? (
              <>
                {hasFollowed ? (
                  <>
                    <button className="event-join-button-disabled" disabled>Followed</button>
                    <button className="event-unregister-button" onClick={handleUnfollow}>Unfollow</button>
                  </>
                ) : (
                  <button className="event-join-button" onClick={handleFollow}>Follow</button>
                )}
                <button className="org-report-button" onClick={handleReport}>Report</button>
                {showReportBox && (
                  <div className="report-box">
                    <textarea
                      rows={6}
                      cols={50}
                      placeholder="Enter report reason..."
                    />
                    <div><button className="report-box-button">Submit</button></div>
                  </div>
                )}
              </>
            ) : (
              <button className="event-join-button-disabled" disabled>Log in to follow</button>
            )}
          </div>
        </div>
        {currentUser && hasFollowed ? (
          <div className='updates-container'>
            <h2>Updates</h2>
            <div className="org-posts-container">
              {orgPosts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </div>
        ) : (
          <></>
        )
        }

        {/* <input type="file" accept="image/*" onChange={handleOrgImgClick} />
        <input type="file" accept="image/*" onChange={handleBannerImgClick} /> */}
      </div>
    </div>
  );
}

export default Org;
