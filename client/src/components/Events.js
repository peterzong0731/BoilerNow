import React, {useState, useEffect} from 'react';
import './Events.css';
import { Link } from 'react-router-dom';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const eventsData = {
    '1': [{ title: 'AAA Meet and Gr...', color: 'red', _id: 1 }],
    '2': [{ title: 'Hello World Info.', color: 'green', _id: 2 }],
    '12': [{ title: 'Bowling Club', color: 'red', _id: 12 }],
    '17': [{ title: 'CSUB Resume W...', color: 'green', _id: 17 }],
    '19': [{ title: 'Random Event', color: 'blue', _id: 19 }],
};

const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
};

const getLastDayOfMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDay();
};
    
const calculateEmptySlotsAfterLastDay = (lastDayOfWeek) => {
    return lastDayOfWeek === 6 ? 0 : 7 - lastDayOfWeek - 1; // Adjust for Sunday being the last day
};

function Events() {
    const currentDate = new Date();
    const [year, setYear] = useState(currentDate.getFullYear());
    const [month, setMonth] = useState(currentDate.getMonth());

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const lastDayOfMonth = getLastDayOfMonth(year, month);
    const emptySlotsAfterLastDay = calculateEmptySlotsAfterLastDay(lastDayOfMonth);

    const emptySlotsAtStart = Array(firstDayOfMonth).fill(null);
    const daySlots = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptySlotsAtEnd = Array(emptySlotsAfterLastDay).fill(null);

    const handleMonthNext = () => {
        if (month === 11) {
            setMonth(0);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    };

    const handleMonthPrev = () => {
        if (month === 0) {
            setMonth(11);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="calendar-container">
        <div className="month-view">
            <div className="month-header">
                <h2>{`${monthNames[month]} ${year}`}</h2>
                <div className="month-navigation">
                    <button onClick={handleMonthPrev}>←</button>
                    <button onClick={handleMonthNext}>→</button>
                </div>
            </div>
            <div className="days-of-week">
                {daysOfWeek.map(day => (
                    <div key={day} className="week-day">{day}</div>
                ))}
            </div>
            <div className="days-grid">
                {emptySlotsAtStart.concat(daySlots).concat(emptySlotsAtEnd).map((day, index) => (
                    <div key={index} className={`day-cell ${day ? '' : 'empty'}`}>
                        {day && <div className="day-number">{day}</div>}
                        {day && eventsData[day] && eventsData[day].map((event, idx) => (
                            <Link key={event._id} to={`/event/${event._id}`}>
                                <div key={idx} className={`event ${event.color}`}>{event.title}</div>
                            </Link>
                        ))}
                    </div>
                ))}
            </div>
        </div>
        </div>
    );
}

export default Events;
