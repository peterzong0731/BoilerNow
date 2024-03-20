import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Org.css'

function Org() {
  const { id } = useParams();
  const [orgData, setOrgData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrg = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/orgs/${id}`);
      console.log(response.data);
      setOrgData(response.data);

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='org-page-outer-container'>
      {orgData.bannerImg && <img src={orgData.bannerImg} alt="Banner Image" className='org-banner'/>}
      <div className='org-page-inner-container'>
        <div className='org-images'>
          {orgData.orgImg && <img src={orgData.orgImg} alt="Organization Image" id='org-pfp'/>}
        </div>
        <div className='org-text'>
          <span id='org-name'>{orgData.name}</span>
          <span id='org-bio'>{orgData.bio}</span>
        </div>
        {/* <input type="file" accept="image/*" onChange={handleOrgImgClick} />
        <input type="file" accept="image/*" onChange={handleBannerImgClick} /> */}
      </div>
    </div>
  );
}

export default Org;
