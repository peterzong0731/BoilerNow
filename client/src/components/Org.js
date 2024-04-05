import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Org.css'
import { Toaster, toast } from 'sonner'
import PostCard from './PostCard';
import EventCard from './EventCard';

function Org() {
  const { id } = useParams();
  const [orgData, setOrgData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [usersFollowed, setUsersFollowed] = useState([])
  const [hasFollowed, setHasFollowed] = useState(false);
  const [orgPosts, setOrgPosts] = useState([])
  const currentUserFromStorage = localStorage.getItem('user');
  const currentUser = currentUserFromStorage ? localStorage.getItem('user') : null;
  const currentUserNameFromStorage = localStorage.getItem('name');
  const currentUserName = currentUserNameFromStorage ? localStorage.getItem('name') : null;
  const [showReportBox, setShowReportBox] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [orgEvents, setOrgEvents] = useState([])

  const fetchOrg = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/orgs/${id}`);

      const { followers, events } = response.data;

      setOrgData(response.data);
      setUsersFollowed(followers)
      setOrgEvents(events)

      console.log(followers)
      console.log(currentUser)
      const isFollowing = followers.some(user => user.userId === currentUser);
      console.log(isFollowing)
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

      setUsersFollowed(prevUsers => [...prevUsers, { userId: currentUser, name: currentUserName }]);
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

  const handleChange = (event) => {
    setReportContent(event.target.value);
  };

  const handleReportSubmit = async () => {
    try {
      const url = `http://localhost:8000/reportOrg/${currentUser}/${id}`;

      const response = await axios.post(url, { reason: reportContent });

      toast.success("Successfully submitted report.");

      setReportContent('');
      setShowReportBox(!showReportBox);

    } catch (error) {
      toast.error('Error in submitting report.');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='org-page-outer-container'>
      <Toaster richColors position="top-center"/>
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
                
              </>
            ) : (
              <button className="event-join-button-disabled" disabled>Log in to follow</button>
            )}
          </div>
        </div>
        {showReportBox && (
          <div className="report-box">
            <textarea
              value={reportContent}
              onChange={handleChange}
              rows={6}
              cols={50}
              placeholder="Enter report reason..."
            />
            <div className="report-content">
              <button 
                disabled={reportContent.trim() === ''} 
                className={reportContent.trim() === '' ? 'report-box-disabled-button' : 'report-box-enabled-button'} 
                onClick={handleReportSubmit}>
                  Submit
              </button>
            </div>
          </div>
        )}
        {currentUser && hasFollowed ? (
          <div className='updates-container'>
            <h2>Updates:</h2>
            <div className="org-posts-container">
              {orgPosts.length ? orgPosts.map(post => (
                <PostCard key={post._id} post={post} />
              )) : <p>No updates</p>}
            </div>
          </div>
        ) : (
          <></>
        )}
        <div className='updates-container'>
          <h2>Events:</h2>
          {orgEvents ? orgEvents.map((event, idx) => (
            <EventCard key={event._id} event={event} />
          )) : <div className='no-orgs-text'>There are no events to display.</div>}
        </div>

        <div className='updates-container'>
          <h2>Members:</h2>
          {usersFollowed ? usersFollowed.map((follower, idx) => (
            <p>{follower.name}</p>
          )) : <div className='no-orgs-text'>There are no members.</div>}
        </div>
        
        {/* <input type="file" accept="image/*" onChange={handleOrgImgClick} />
        <input type="file" accept="image/*" onChange={handleBannerImgClick} /> */}
      </div>
    </div>
  );
}

export default Org;
