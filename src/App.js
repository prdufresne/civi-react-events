import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';


function Calendar(props) {
    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const startParts = props.start.split(" ");
    const endParts = props.end.split(" ");
    const startDate = Date.parse(startParts[0]);
    const endDate = Date.parse(endParts[0]);

    const startWeekay = startDate.getDay();
    const endWeekday = endDate.getDay();

    return (
        <div class="civi-event-calendar-cell-date">
            <div class="civi-event-calendar-weekday">{startWeekay}</div>
            <div class="civi-event-calendar-day multiday">{startDate.getDate()}</div>
        </div>
    )
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

        console.log("Events List:", events);

        return (
            <Container>
                {events.map((event, index) => {
                return (
                    <Row index={index}>
                        <Col md={2}>
                            <Calendar
                                start={event.start_date}
                                end={event.end_date}
                            />
                        </Col>
                        <Col md={10}>
                            <h2>{event.title}</h2>
                            <p>{event.summary}</p>
                        </Col>
                    </Row>
                )
            })}
            </Container>
        );
    }
}
export default App; 