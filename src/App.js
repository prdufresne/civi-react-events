import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';


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
                    console.log('Got this from the server: ', response);
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

        return (
            <Container>
                {events.map((event, index) => {
                return (
                    <Row index={index}>
                        <Col md={2}>
                            {event.start_date}
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