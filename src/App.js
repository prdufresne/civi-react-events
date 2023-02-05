import React from 'react';
import {Container, Row, Col} from 'react-bootstrap';
// import Dashboard from './components/Dashboard';

const App = () => {

    const title="Civi React Calendar"
    const eventList = JSON.parse(document.getElementById('eventList').innerText);
    console.log(eventList);

    return (
        <Container>
            <h2 className='app-title'>{title}</h2>
            <hr />
            
            {eventList.map((event, index) => {
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

export default App; 