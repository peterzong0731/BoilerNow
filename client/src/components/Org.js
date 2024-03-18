import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AiOutlineMail, AiOutlineTwitter, AiOutlinePhone } from 'react-icons/ai';
import { CopyToClipboard } from 'react-copy-to-clipboard';
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
      {orgData.bannerImg && <img src={orgData.orgImg} alt="Banner Image" className='org-banner'/>}
      <div className='org-page-inner-container'>
        <div className='org-images'>
          {orgData.orgImg && <img src={orgData.orgImg} alt="Organization Image" id='org-pfp'/>}
        </div>
        <div className='org-text'>
          <div className='org-first-row'>
            <span id='org-name'>{orgData.name}</span>
            <div className='org-contact-info'>
              {orgData.contactInfo.email && (
                <CopyToClipboard text={orgData.contactInfo.email}>
                  <span className="icon-container" title={orgData.contactInfo.email}>
                    <AiOutlineMail className="icon" />
                  </span>
                </CopyToClipboard>
              )}
              {orgData.contactInfo.twitter && (
                <a className="twitter-link" href={orgData.contactInfo.twitter} target="_blank" rel="noopener noreferrer" title={orgData.contactInfo.twitter}>
                  <AiOutlineTwitter className="icon" />
                </a>
              )}
              {/* TODO: need discord icon */}
              {/* {orgData.contactInfo.discord && (
                <CopyToClipboard text={orgData.contactInfo.discord}>
                  <span className="icon-container" title="Copy Discord">
                    <AiOutlineTwitter className="icon" />
                  </span>
                </CopyToClipboard>
              )} */}
              {orgData.contactInfo.phoneNumber && (
                <CopyToClipboard text={orgData.contactInfo.phoneNumber}>
                  <span className="icon-container" title={orgData.contactInfo.phoneNumber}>
                    <AiOutlinePhone className="icon" />
                  </span>
                </CopyToClipboard>
              )}
            </div>
          </div>
          <span id='org-bio'>{orgData.bio}</span>
        </div>
        {/* <input type="file" accept="image/*" onChange={handleOrgImgClick} />
        <input type="file" accept="image/*" onChange={handleBannerImgClick} /> */}
      </div>
    </div>
  );
}

export default Org;
