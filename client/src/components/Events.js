import React, {useState, useEffect} from 'react';
import './Events.css';

const year = 2024;
const month = 2;
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
};

const eventsData = {
    '1': [{ title: 'AAA Meet and Gr...', color: 'red' }],
    '2': [{ title: 'Hello World Info.', color: 'green' }],
    '12': [{ title: 'Bowling Club', color: 'red' }],
    '17': [{ title: 'CSUB Resume W...', color: 'green' }],
    '19': [{ title: 'Random Event', color: 'blue' }],
};

const getLastDayOfMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDay();
};
    
const calculateEmptySlotsAfterLastDay = (year, month) => {
    const lastDayOfWeek = getLastDayOfMonth(year, month);

    return 7 - lastDayOfWeek;
};

const handleMonthNext = () => {

}

const handleMonthPrev = () => {
    
}

function Events() {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const daySlots = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptySlotsAtStart = Array(firstDayOfMonth).fill(null);
    const emptySlotsAfterLastDay = calculateEmptySlotsAfterLastDay(year, month);
    const emptySlotsAtEnd = Array(emptySlotsAfterLastDay -1).fill(null);

    return (
        <div className="calendar-container">
        <div className="month-view">
            <div className="month-header">
                <h2>March 2024</h2>
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
                            <div key={idx} className={`event ${event.color}`}>{event.title}</div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
        </div>
    );
}

export default Events;
