import React from 'react';

import peopleGroup from './icons/people-group.svg';

function Calendar(props) {
    const { startDate, endDate } = props;

    let weekdayString = startDate.weekday;
    let dayString = startDate.day;
    let style = "";

    if (endDate && startDate.date != endDate.date) {
        weekdayString = `${startDate.weekday.substring(0, 3)}-${endDate.weekday.substring(0, 3)}`
        dayString += `-${parseInt(endDate.day)}`;
        style = " multiday";
    }

    return (
        <div class="civi-react-events-cell-date">
            <div class="civi-react-events-weekday">{weekdayString}</div>
            <div class={"civi-react-events-day" + style}>{dayString}</div>
        </div>
    )
}

// function parseDate(dateString) {
//     const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//     let date = undefined;
//     if (dateString) {
//         const regEx = /(?<date>(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})) (?<time>(?<hour>\d{2}):(?<minutes>\d{2})):(?<seconds>\d{2})/gm;
//         date = regEx.exec(dateString).groups;
//         date.day = parseInt(date.day);
//         const dateObject = new Date(date.date);
//         date.month = dateObject.toLocaleString('default', { month: 'long' })
//         date.weekday = weekday[dateObject.getDay()];
//     }
//     return date;
// }

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            title: "Civi React Calendar",
            events: [],
            event_types: [],
            showFilter: false,
            filters: {},
        };

        this.changeHandler = this.changeHandler.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        const events = this.fetchEvents()
            .then((result) => {

                // console.log("result:", result);

                const { events, event_types } = result;

                // parse dates and capture event types
                // events.forEach(event => {
                //     event.start_date = parseDate(event.start_date);
                //     event.end_date = parseDate(event.end_date);
                // });

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

                event_types.forEach(event_type => {
                    filters.event_type[event_type.value] = false;
                })

                this.setState({
                    events,
                    event_types,
                    filters,
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

        this.setState({
            filters,
        })
    }

    anyChecked(filter) {
        let checked = false;
        filter && Object.keys(filter).forEach(key => {
            checked = checked || filter[key];
        })
        return checked;
    }

    render() {
        const { event_types, events, showFilter, filters } = this.state;
        let currentMonth = "";

        return (
            <div>
                <div className={`civi-react-events-filter-block`}>
                    <div className={`civi-react-events-button right`} onClick={() => this.setState({ showFilter: !showFilter })}>
                        {showFilter ? 'Hide Filters' : 'Show Filters'}
                    </div>
                    <div className={`civi-react-events-filters ${showFilter ? '' : 'hide'}`}>
                        <div className="civi-react-events-filters-types">
                            {event_types.map((event_type, index) =>
                                <>
                                    <input type="checkbox"
                                        name="event_type" id={event_type.value}
                                        onChange={this.changeHandler}
                                        checked={this.filters?.event_type[event_type.value]} />
                                    <label>{event_type.label}</label>
                                    <br />
                                </>
                            )}
                        </div>
                        <div  className="civi-react-events-filters-status">
                            <input type="checkbox" name="registration" id='registered' onChange={this.changeHandler} />
                            <label>Registered</label>
                            <br />
                            <input type="checkbox" name="registration" id='not_registered' onChange={this.changeHandler} />
                            <label>Not Registered</label>
                            <br />
                            <input type="checkbox" name="event_full" id='available' onChange={this.changeHandler} />
                            <label>Available Events</label>
                            <br />
                            <input type="checkbox" name="event_full" id='full' onChange={this.changeHandler} />
                            <label>Full Events</label>
                            <br />
                        </div>
                    </div>
                </div>
                {events.map((event, index) => {

                    if ((!filters.applied.event_type || filters.event_type[event.event_type_id.toString()]) &&
                        (!filters.applied.registration || filters.registration[event.is_registered ? 'registered' : 'not_registered']) &&
                        (!filters.applied.event_full || filters.event_full[event.is_full ? 'full' : 'available'])
                    ) {

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
                                <a href={event.event_url}>
                                    <div index={index} type={event['event_type_id:label']} className="civi-react-events-event">
                                        <Calendar
                                            startDate={start_date}
                                            endDate={end_date}
                                        />
                                        <div className="civi-react-events-content-column">
                                            <div className='civi-react-events-actions'>
                                                {event.is_online_registration && !event.is_full && !event.is_registered &&
                                                    <a href={event.registration_url}>
                                                        <div className={`civi-react-events-button`}>Register</div>
                                                    </a>
                                                }
                                                {/* <div className='civi-react-events-action-icons'> */}
                                                <img src={peopleGroup} />
                                                {/* </div> */}
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
                                </a>
                            </>
                        )
                    }
                })}
            </div>
        );
    }
}
export default App; 