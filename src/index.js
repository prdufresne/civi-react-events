
// Render the App component into the DOM if it exists
const civiReactEvents = document.getElementById('civi-react-events');
import App from "./App";
import { render } from '@wordpress/element';
import './style/main.scss';

if(civiReactEvents) {
    render(<App />, civiReactEvents);
}

