import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function Calendar(props) {
    const {startDate, endDate} = props;

    let weekdayString = startDate.weekday;
    let dayString = startDate.day;
    let style = "";

    if(startDate.date != endDate.date) {
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
    let date = {};
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
         };
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        const events = this.fetchEvents()
            .then((events) => {
                this.setState({
                    events,
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
                // },
                // function (err) {
                //     return reject(err);
                }
            );
        })

    }

    render() {

        const { title, events } = this.state;
        let currentMonth = "";

        return (
            <Container>
                {events.map((event, index) => {
                    const startDate = parseDate(event.start_date);
                    const endDate = parseDate(event.end_date);
                    let monthHeader = "";

                    if(startDate.month != currentMonth) {
                        currentMonth = startDate.month;
                        monthHeader = (<h3>{currentMonth}</h3>);
                    }

                    return (
                        <>
                            {monthHeader}
                            <Row index={index} className="civi-react-events-event">
                                <Col md={'auto'}>
                                    <Calendar
                                        startDate={startDate}
                                        endDate={endDate}
                                    />
                                </Col>
                                <Col>
                                    <div className='civi-react-events-title'>{event.title}</div>
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