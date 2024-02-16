import React from 'react'
import './Event.css'

function Event(props) {
  return (
    <div className="event-container">
        <h1 className="event-title">Event Title</h1>
        <div className="event-category-tag">Academic</div>
        <h2 className="event-organizer">by User | Club</h2>
        <button className="event-join-button">Join</button>
        <div className="event-dates">
            <div className="event-date">{'\u{1F4C5}'} Feb 19, 2023 - 12:30 PM to Feb 19, 2023 - 2:30 PM</div>
        </div>
        <div className="event-location">{'\u{1F4CD}'} Online</div>
        <h2 className="event-description-title">Description:</h2>
        <p className="event-description"> Event details... </p>
    </div>
  )
}

export default Event