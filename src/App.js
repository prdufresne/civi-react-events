import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function Calendar(props) {
    const {startDate, endDate} = props;

    let weekdayString = startDate.weekday;
    let dayString = startDate.day;
    let style = "";

    if(endDate && startDate.date != endDate.date) {
        weekdayString = `${startDate.weekday.substring(0,3)}-${endDate.weekday.substring(0,3)}`
        dayString += `-${parseInt(endDate.day)}`;
        style = " multiday";
    }

    return (
        <div class="civi-event-calendar-cell-date">
            <div class="civi-event-calendar-weekday">{weekdayString}</div>
            <div class={"civi-event-calendar-day" + style}>{dayString}</div>
        </div>
    )
}

function parseDate(dateString) {
    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    let date = undefined;
    if (dateString) {
        const regEx = /(?<date>(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})) (?<time>(?<hour>\d{2}):(?<minutes>\d{2})):(?<seconds>\d{2})/gm;
        date = regEx.exec(dateString).groups;
        date.day = parseInt(date.day);
        const dateObject = new Date(date.date);
        date.month = dateObject.toLocaleString('default', { month: 'long' })
        date.weekday = weekday[dateObject.getDay()];
    }
    return date;
}

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = { 
            title: "Civi React Calendar",
            events: [],
            eventTypes: [],
            showFilter: false,
         };
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        const events = this.fetchEvents()
            .then((result) => {

                console.log("result:", result);

                const { events, event_types } = result;
                // const eventTypes = [];

                // parse dates and capture event types
                events.forEach(event => {
                    event.start_date = parseDate(event.start_date);
                    event.end_date = parseDate(event.end_date);
                    event.is_registered = (event.is_registered[0].count > 0);
                    event.participants = event.participants[0].count;
                });

                this.setState({
                    events,
                    eventTypes: event_types,
                })
            });
    }

    fetchEvents = () => {
        return new Promise((resolve, reject) => {
            const queryParameters = {
                'action': 'civi_react_events',
                'request': 'event-list',
                'data': `This is data passed to the backed`,
            };

            jQuery.post(my_ajax_object.ajax_url, queryParameters,
                function (response) {
                    return resolve(JSON.parse(response));
                }
            ).fail(function (err) {
                return reject(err);
            })
        })
    }

    render() {
        const { event_types, events, showFilter } = this.state;
        let currentMonth = "";

        console.log("Event Types:", event_types);
        console.log("Event List:", events)

        return (
            <Container>
                <div className={`civi-react-events-button`} onClick={() => this.setState({showFilter: !showFilter})}>
                    {showFilter ? 'Hide Filters' : 'Show Filters'}
                </div>
                {showFilter &&
                    <div>
                        Event Types:
                    </div>
                }
                {events.map((event, index) => {
                    const { start_date, end_date } = event;
                    let isFirstMonth = false;

                    if(start_date.month != currentMonth) {
                        currentMonth = start_date.month;
                        isFirstMonth = true;
                    }

                    return (
                        <>
                            {isFirstMonth &&
                                <h3>{currentMonth}</h3>
                            }
                            <Row index={index} className="civi-react-events-event">
                                <Col md={'auto'}>
                                    <Calendar
                                        startDate={start_date}
                                        endDate={end_date}
                                    />
                                </Col>
                                <Col>
                                    {event.is_online_registration &&
                                        <a href={event.registration_url}>
                                            <div className={`civi-react-events-button ${event.event_type}`}>Register</div>
                                        </a>
                                    }
                                    <a href={event.event_url}>
                                        <div className='civi-react-events-title'>{event.title}</div>
                                    </a>
                                    <div className='civi-react-events-description'>{event.summary}</div>
                                </Col>
                            </Row>
                        </>
                    )
                })}
            </Container>
        );
    }
}
export default App; 