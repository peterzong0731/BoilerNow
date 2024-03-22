import React from 'react';
import './OrgCard.css';
import { useNavigate } from 'react-router-dom';

function OrgCard({ org }) {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/org/${org._id}`);
    };
    return (
        <div className="org-card-container" onClick={handleClick}>
            <img src={org.bannerImg} alt={`${org.name} Banner`} className="org-banner" />
            <div className="org-content">
                <div className="org-header">
                <img src={org.orgImg} alt={`${org.name} Logo`} className="org-logo" />
                <h3 className="org-name">{org.name}</h3>
                <p className="org-shorthand">{org.shorthand}</p>
                </div>
                <p className="org-bio">{org.bio}</p>
                <div className="org-footer">
                <span className="org-last-active">Last active: {new Date(org.lastActive).toLocaleDateString()}</span>
                <span className="org-followers-count">Followers: {org.followers.length}</span>
                </div>
            </div>
        </div>
    );
}

export default OrgCard;
