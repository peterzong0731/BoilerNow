import React, {useState, useEffect} from 'react';
import './Events.css';
import { Link } from 'react-router-dom';
import axios from 'axios'

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const categories = ['all', 'Social', 'Academic', 'Other'];

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
    const userStr = localStorage.getItem('user');

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
 
    const [eventsData, setEventsData] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        console.log(selectedCategory)
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:8000/events', {
                    params: { year: year, month: month }
                });
                const events = response.data;
                console.log(events)
                const eventsMappedByDay = {};

                events.forEach(event => {
                    const dayOfMonth = new Date(event.eventStartDatetime).getDate();
                    if (!eventsMappedByDay[dayOfMonth]) {
                        eventsMappedByDay[dayOfMonth] = [];
                    }
                    eventsMappedByDay[dayOfMonth].push(event);
                });

                setEventsData(eventsMappedByDay);
            } catch (error) {
                console.error('Error fetching events', error);
            }
        };
        fetchEvents();
    }, [year, month]);

    return (
        <div className="calendar-container">
            <div className="filters">
                {categories.map((category) => (
                    <label key={category}>
                        <input
                            type="radio"
                            name="category"
                            value={category}
                            checked={selectedCategory === category}
                            onChange={handleCategoryChange}
                        />
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </label>
                ))}
            </div>
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
                    {console.log(eventsData)}
                    {emptySlotsAtStart.concat(daySlots).concat(emptySlotsAtEnd).map((day, index) => (
                        <div key={index} className={`day-cell ${day ? '' : 'empty'}`}>
                            {day && <div className="day-number">{day}</div>}
                            {day && eventsData[day] && eventsData[day].filter((event) => (selectedCategory === 'all' || event.category === selectedCategory) && ((event.status == 'public') || userStr)).map((event, idx) => (
                                <Link key={event._id} to={`/event/${event._id}`}>
                                    <div className={`event ${event.category}`}>{event.title}</div>
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
