import React from 'react';

import peopleGroup from './icons/people-group.svg';
import trashCan from './icons/trash-can.svg';
import calendarLink from './icons/calendar-link.svg';


function Calendar(props) {
    const { startDate, endDate } = props;

    const subClass = props.subClass ? " " + props.subClass : '';

    let weekdayString = startDate.weekday;
    let dayString = startDate.day;
    let style = ""; 

    if (endDate && startDate.date != endDate.date) {
        weekdayString = `${startDate.weekday.substring(0, 3)}-${endDate.weekday.substring(0, 3)}`
        dayString += `-${parseInt(endDate.day)}`;
        style = " multiday";
    }

    return (
        <div className={"civi-react-events-cell-date" + subClass}>
            <div className="civi-react-events-weekday">{weekdayString}</div>
            <div className={"civi-react-events-day" + style}>{dayString}</div>
        </div>
    )
}

function ParticipantsModal(props) {

    return (
        <div className={`civi-react-events-modal`} onClick={props.closeModal}>
            <div className='civi-react-events-modal-content'>
                <h3>Event Participants</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Attendee Role</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.participants.map((participant, index) =>
                            <tr>
                                <td>{participant.name}</td>
                                <td>{participant['role_id:label'] && participant['role_id:label'].join(', ')}</td>
                                <td>{participant['status_id:label']}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className={`civi-react-events-button`} onClick={props.closeModal}>Close</div>
            </div>
        </div>
    )
}

function RegistrationModal(props) {

  
    return (
        <div className={`civi-react-events-modal`} onClick={props.closeModal}>
            <div className='civi-react-events-modal-content'>
                <div dangerouslySetInnerHTML={{
                    __html:
                        `${props.event.intro_text}
                        <h3>${props.event.confirm_title}</h3>
                        ${props.event.confirm_text}`
                }} />
                <div className={`civi-react-events-button`} onClick={(e) => props.register(e, props.event.id)}>Register</div>
            </div>
        </div>
    )
}

function EventDetailsModal(props) {

    const regex = /^<(\w+)><img.*><\/\1>/g;

    const dateModifier = regex.test(props.event.description) ? 'overlay' : '';

    return (
        
        <div className={`civi-react-events-modal`} onClick={props.closeModal}>
            <div className='civi-react-events-modal-content' type={props.event['event_type_id:label']}>
                <Calendar subClass={dateModifier} startDate={props.event.start_date} endDate={props.event.end_date} />
                <div style={{clear: 'both'}} dangerouslySetInnerHTML={{
                    __html: props.event.description
                }} />
                <br/>
                <div className={`civi-react-events-button`} onClick={props.closeModal}>Close</div>
            </div>
        </div>
    )
}

class App extends React.Component {

    constructor(props) {
        super(props);

        const filters = {
            applied: {
                event_type: false,
                registration: false,
                event_full: false,
            },
            event_type: {},
            registration: {
                registered: false,
                not_registered: false,
            },
            event_full: {
                available: false,
                full: false,

            }
        }


        this.state = {
            title: "Civi React Calendar",
            events: [],
            event_types: [],
            showFilter: false,
            filters,
            participantsList: undefined,
            eventToRegister: undefined,
            eventDetails: undefined,
        };

        this.changeHandler = this.changeHandler.bind(this);
        this.clearFilters = this.clearFilters.bind(this);
        this.closeParticipantsModal = this.closeParticipantsModal.bind(this);
        this.closeRegistrationModal = this.closeRegistrationModal.bind(this);
        this.closeEventDetails = this.closeEventDetails.bind(this);
        this.registerForEvent = this.registerForEvent.bind(this);
        this.loadData = this.loadData.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        const events = this.fetchEvents()
            .then((result) => {

                // console.log("result:", result);

                const { events, event_types, user_status, ical_link } = result;   
                
                const filters = this.state.filters;

                event_types.forEach(event_type => {
                    if(!(event_type.value in filters.event_type))
                    filters.event_type[event_type.value] = false;
                })


                console.log("User status:", user_status);

                this.setState({
                    events,
                    event_types,
                    ical_link,
                    filters,
                    is_member: user_status.is_member,
                    is_trail_leader: user_status.is_trail_leader,
                    is_executive: user_status.is_executive,
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

    showEventParticipants = (event, id) => {
        event.stopPropagation();
        this.fetchParticipants(id)
            .then((result) => {
                this.setState({
                    participantsList: result,
                })
            })
    }

    fetchParticipants = (id) => {
        return new Promise((resolve, reject) => {
            const queryParameters = {
                'action': 'civi_react_events',
                'request': 'participant-list',
                'data': id,
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

    changeHandler(event) {
        const { name, id, checked } = event.target;
        const { filters } = this.state;

        filters[name][id.toString()] = checked;
        filters.applied[name] = this.anyChecked(filters[name]);

        console.log("filters:", filters)

        this.setState({
            filters,
        })
    }

    clearFilters(event) {
        const { filters } = this.state;

        Object.keys(filters).forEach((level1) => {
            Object.keys(filters[level1]).forEach((level2) => {
                filters[level1][level2] = false;
            })
        })

        console.log("filters:", filters)

        this.setState({
            filters,
        })
    }

    closeParticipantsModal(event) {
        event.stopPropagation();
        this.setState({
            participantsList: undefined,
        })
    }

    registrationClickHandler(e, event) {

        if (this.state.is_member) {
            e.stopPropagation();
            this.setState({
                eventToRegister: event,
            })
        } else {
            this.handleNavigate(event.registration_url)
        }
    }

    showDetailsClickHandler(e, event) {
        e.stopPropagation();
        if (event.description) {
            this.setState({
                eventDetails: event,
            })
        } else {
            this.handleNavigate(e, event.event_url)
        }
    }

    closeRegistrationModal(event) {
        event.stopPropagation();
        this.setState({
            eventToRegister: undefined,
        })
    }

    closeEventDetails(event) {
        event.stopPropagation();
        this.setState({
            eventDetails: undefined,
        })
    }

    registerForEvent(e, id) {
        const queryParameters = {
            'action': 'civi_react_events',
            'request': 'register-for-event',
            'data': id,
        };

        const loadData = this.loadData;
        jQuery.post(my_ajax_object.ajax_url, queryParameters,
            function (response) {
                console.log("Response:", response)
                loadData();
            }
        ).fail(function (err) {
            console.log("Could not register:", err)
        })
        this.closeRegistrationModal(e);       
    }
    
    deregisterFromEvent(e, id) {
        const queryParameters = {
            'action': 'civi_react_events',
            'request': 'deregister-from-event',
            'data': id,
        };

        const loadData = this.loadData;
        jQuery.post(my_ajax_object.ajax_url, queryParameters,
            function (response) {
                console.log("Response:", response)
                loadData();
            }
        ).fail(function (err) {
            console.log("Could not deregister:", err)
        })
        this.closeRegistrationModal(e);       
    }

    anyChecked(filter) {
        let checked = false;
        filter && Object.keys(filter).forEach(key => {
            checked = checked || filter[key];
        })
        return checked;
    }

    handleNavigate(e,destination) {
        window.location.href=destination;
    }

    render() {
        const { event_types, events, showFilter, filters, ical_link } = this.state;
        let currentMonth = "";

        return (
            <div className='civi-react-events'>
                <a className='civi-react-events-ical' href={ical_link}><img src={calendarLink}/>Copy this link to subscribe to this calendar</a>
                {this.state.participantsList ? <ParticipantsModal closeModal={this.closeParticipantsModal} participants={this.state.participantsList} /> : ''}
                {this.state.eventToRegister ? <RegistrationModal
                    event={this.state.eventToRegister}
                    closeModal={this.closeRegistrationModal}
                    register={this.registerForEvent}
                /> : ''}
                {this.state.eventDetails ? <EventDetailsModal closeModal={this.closeEventDetails} event={this.state.eventDetails}/> : '' }
                {filters && <div className={`civi-react-events-filter-block`}>
                    <div className={`civi-react-events-button right`} onClick={() => this.setState({ showFilter: !showFilter })}>
                        {showFilter ? 'Hide Filters' : 'Show Filters'}
                    </div>
                    <div className={`civi-react-events-filters ${showFilter ? '' : 'hide'}`}>
                        <div className="civi-react-events-filters-group">
                            {event_types.map((event_type, index) =>
                                <>
                                    <input type="checkbox"
                                        name="event_type" id={event_type.value}
                                        onChange={this.changeHandler}
                                        checked={filters.event_type[event_type.value]} />
                                    <label>{event_type.label}</label>
                                    <br />
                                </>
                            )}
                        </div>
                        <div className="civi-react-events-filters-group">
                            <input type="checkbox" name="registration" id='registered' onChange={this.changeHandler}
                                checked={filters.registration.registered} />
                            <label>Registered</label>
                            <br />
                            <input type="checkbox" name="registration" id='not_registered' onChange={this.changeHandler}
                                checked={filters.registration.not_registered} />
                            <label>Not Registered</label>
                            <br />
                            <input type="checkbox" name="event_full" id='available' onChange={this.changeHandler}
                                checked={filters.event_full.available} />
                            <label>Available Events</label>
                            <br />
                            <input type="checkbox" name="event_full" id='full' onChange={this.changeHandler} 
                                checked={filters.event_full.full} />
                            <label>Full Events</label>
                            <br />
                        </div>
                        <div className={`civi-react-events-button right`} onClick={this.clearFilters}>Clear Filters</div>
                    </div>
                </div> }
                {events.map((event, index) => {

                    if ((!filters.applied.event_type || filters.event_type[event.event_type_id.toString()]) &&
                        (!filters.applied.registration || filters.registration[event.is_registered ? 'registered' : 'not_registered']) &&
                        (!filters.applied.event_full || filters.event_full[event.is_full ? 'full' : 'available'])
                    ) {

                        const eventType = event['event_type_id:label'];
                        const showParticipants = event.is_online_registration && (
                            (this.state.is_executive && eventType == 'AGM') ||
                            (this.state.is_trail_leader && (eventType == 'Member-Run' || eventType == 'Open-Run') )
                        )

                        const showRegistration = (event.is_online_registration && !event.is_full && !event.is_registered &&
                            (!(eventType == 'Member-Run') || (eventType == 'Member-Run' && this.state.is_member) )
                        )

                        const { start_date, end_date } = event;
                        let isFirstMonth = false;

                        if (start_date.month != currentMonth) {
                            currentMonth = start_date.month;
                            isFirstMonth = true;
                        }

                        return (
                            <>
                                {isFirstMonth &&
                                    <h3>{currentMonth}</h3>
                                }
                                <div index={index}
                                    type={event['event_type_id:label']}
                                    className="civi-react-events-event"
                                    onClick={(e) => this.showDetailsClickHandler(e, event)}
                                >
                                    <Calendar
                                        startDate={start_date}
                                        endDate={end_date}
                                    />
                                    <div className="civi-react-events-content-column">
                                        <div className='civi-react-events-actions'>
                                            {showRegistration &&
                                                <div className={`civi-react-events-button`} onClick={(e) => this.registrationClickHandler(e, event)}>Register</div>
                                            }
                                            {showParticipants &&
                                                <img src={peopleGroup} onClick={(e) => this.showEventParticipants(e, event.id)} />
                                            }
                                            {event.is_registered &&
                                                    <img src={trashCan} onClick={(e) => this.deregisterFromEvent(e, event.id)} />
                                            }
                                        </div>
                                        <div className='civi-react-events-title'>
                                            {event.title}
                                            {event.is_online_registration && (event.is_full ?
                                                <div className='civi-react-events-pill full'>Full</div>
                                                :
                                                <div className='civi-react-events-pill'>{`${event.participants}/${event.max_participants}`}</div>
                                            )}
                                            {event.is_registered && <div className='civi-react-events-pill registered'>Registered</div>}
                                        </div>
                                        <div className='civi-react-events-description'>{event.summary}</div>

                                    </div>
                                </div>
                            </>
                        )
                    }
                })}
            </div>
        );
    }
}
export default App; 