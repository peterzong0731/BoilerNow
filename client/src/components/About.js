import React, { useState, useEffect } from 'react';
import Users from './images/users.png'
import Orgs from './images/org.png'
import Event from './images/event.png'
import axios from 'axios';
import './About.css'


function About() {
    const [userCount, setUserCount] = useState([]);
    const [eventCount, setEventCount] = useState([]);
    const [orgCount, setOrgCount] = useState([]);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await axios.get('http://localhost:8000/stats');
                const data = await response.data;
                setUserCount(data.events.totalEventCnt);
                setEventCount(data.users.totalUserCnt);
                setOrgCount(data.orgs.totalOrgCnt);
            } catch (error) {
                console.error(error);
            }
        };
        fetchStats();
    }, []);


    return (
      <div>
        <br />
        <br />
        <h4>
            Purdue students and event organizers today often struggle to discover and seamlessly organize events respectively, leading to scheduling conflicts and missed opportunities for campus/club engagement. The existing method for event coordination (BoilerLink) is often overlooked as it is rudimentary, very unintuitive to use, and lacks many trending features that would allow for seamless communication between organizers and attendees. 
        </h4>
        <h4>
            To solve this huge need for boilermakers, we want to bring to life an application that, unlike BoilerLink, will incorporate features like a real-time feed of events in and around Purdue, instant updates and notification by organizers to their respective events, as well as interaction with event feeds in the form of likes and comments. Furthermore, we will develop a fully functional calendar view of all events on campus with their respective details (time, location, host, etc.), allowing for a simple and seamless user experience.
        </h4>

        <br />

        <div className='stats-container'>
          <div className='individual-stat-container'>
          <img id="events" src={Event} alt="event img" />
            <span>{eventCount} Events</span>
          </div>
          <div className='individual-stat-container'>
            <img id="users" src={Users} alt="users img" />
            <span>{userCount} Users</span>
          </div>
          <div className='individual-stat-container'>
            <img id="orgs" src={Orgs} alt="org img" />
            <span>{orgCount} Organizations</span>
          </div>
        </div>
      </div>
    )
}

export default About