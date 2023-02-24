<?php
/**
 * Plugin Name:       CiviCRM React Event Plugin
 * Description:       Displays CiviCRM events in WordPress using React
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.1
 * Author:            Paul dufresne
 * License:           MIT
 * License URI:       https://github.com/prdufresne/civi-react-events/blob/main/LICENSE
 * Text Domain:       civi_react_events
 */

namespace CiviReactEvents;

// add_action( 'admin_menu', __NAMESPACE__ . 'admin_page' );
add_shortcode('civi-react-events', __NAMESPACE__ . '\render_shortcode');
add_action( 'wp_ajax_civi_react_events', __NAMESPACE__ . '\user_action' );
add_action( 'wp_ajax_nopriv_civi_react_events', __NAMESPACE__ . '\non_user_action' );

/**
 * Init Admin Menu.
 *
 * @return void
 */
function admin_menu() {
    add_menu_page( __( 'Civi React Events', 'civi-react-events'), __( 'Civi React Events', 'civi-react-events'), 'manage_options', 'civi-react-events', __NAMESPACE__ . '\admin_page', 'dashicons-admin-post', '2.1' );
}

/**
 * Init Admin Page.
 *
 * @return void
 */
function admin_page() {
    require_once plugin_dir_path( __FILE__ ) . 'templates/app.php';
}

function user_action() {
    // If the user is logged in, fire this function
    $result = null;

    if(isset($_POST["request"])){
        switch($_POST["request"]) {
            case "event-list":
                $result = events_and_types();
                break;
            case "participant-list":
                $result = participant_list($_POST["data"]);
                break;
        }
    };
    echo json_encode($result);
    wp_die();
}

function non_user_action() {
    // If the user is not logged in, fire this function
    $result = null;

    if(isset($_POST["request"])){
        switch($_POST["request"]) {
            case "event-list":
                $result = events_and_types();
                break;
        }
    };

    echo json_encode($result);
    wp_die();
}

function parse_date($date_string) {
    $result = null;
    if($date_string != null) {
        $date = date_create_from_format('Y-m-d H:i:s', $date_string);
        $result = array(
            'string' => $date_string,
            'date' => date_format($date, 'Y-m-d'),
            'year' => date_format($date, 'Y'),
            'month' => date_format($date, 'F'),
            'day' => date_format($date, 'j'),
            'weekday' => date_format($date, 'l'),
            'time' => date_format($date, 'g:ia'),
        );
    }   
    return $result;
}

function participant_list($event_id) {
    $participants = \Civi\Api4\Participant::get(FALSE)
    ->addSelect('(contact_id.display_name) AS name', 'role_id:label')
    ->addWhere('event_id', '=', $event_id)
    ->addOrderBy('contact_id.last_name', 'ASC')
    ->addOrderBy('contact_id.first_name', 'ASC')
    ->execute();
    return $participants;
}

function user_status() {
    $valid_status = array('New', 'Current', 'Grace');

    $memberships = \Civi\Api4\Membership::get(FALSE)
        ->addSelect('contact_id', 'membership_type_id:label', 'status_id:label')
        ->addWhere('contact_id', '=', 'user_contact_id')
        ->addWhere('membership_type_id:label', '=', 'Club Member')
        ->setLimit(25)
        ->execute();
    
        $is_member = (count($memberships) > 0 && in_array($memberships[0]['status_id:label'], $valid_status) );

        $tags = \Civi\Api4\EntityTag::get(FALSE)
            ->addSelect('tag_id.name', 'entity_id')
            ->addWhere('entity_id', '=', $memberships[0]['contact_id'])
            ->addWhere('tag_id.name', '=', 'Trail Leader')
            ->execute();

    $result = array(
        'tags' => $tags,
        'memberships' => $memberships,
        'is_member' => $is_member,
        'is_trail_leader' => ($is_member && (count($tags) > 0))
    );
    return $result;
}

function event_type_list() {
    $type_list = \Civi\Api4\OptionGroup::get(FALSE)
        ->addSelect('id')
        ->addWhere('name', '=', 'event_type')
        ->setLimit(1)
        ->addChain('type_list', \Civi\Api4\OptionValue::get(FALSE)
            ->addSelect('value', 'label')
            ->addWhere('option_group_id', '=', '$id')
            ->addWhere('is_active', '=', TRUE)
            ->setLimit(25)
        )
        ->execute()
        ->first();
    return $type_list['type_list'];
}

function event_list() {
    $events = \Civi\Api4\Event::get(FALSE)
        ->addSelect('id', 'title', 'summary', 'start_date', 'end_date', 'event_type_id','event_type_id:label', 'max_participants', 'is_online_registration')
        ->addWhere('start_date', '>=', date('Y-m-d'))
        ->addWhere('start_date', '<=', date('Y'). '-12-31')
        ->addChain('participants', \Civi\Api4\Participant::get(FALSE)
            ->addSelect('COUNT(id) AS count')
            ->addWhere('event_id', '=', '$id')
        )
        ->addChain('is_registered', \Civi\Api4\Participant::get(FALSE)
            ->addSelect('COUNT(id) AS count')
            ->addWhere('event_id', '=', '$id')
            ->addWhere('contact_id', '=', 'user_contact_id')
        )
        ->addOrderBy('start_date', 'ASC')
        ->execute();

    $index = 0;
    foreach($events as $event) {
        $id = $event['id'];
        $events[$index]['event_url'] = \CRM_Utils_System::url( 'civicrm/event/info', "reset=1&id=$id", false, false, false, true );
        $events[$index]['registration_url'] = \CRM_Utils_System::url( 'civicrm/event/register', "reset=1&id=$id", false, false, false, true );
        $events[$index]['participants'] = $event['participants'][0]['count'];
        $events[$index]['is_registered'] = ($event['is_registered'][0]['count'] > 0);
        $events[$index]['start_date'] = parse_date($event['start_date']);
        $events[$index]['end_date'] = parse_date($event['end_date']);
        $events[$index]['is_full'] = $event['is_online_registration']  && ($event['participants'][0]['count'] >= $event['max_participants']);
        $index++;
    }

    return $events;
}

function events_and_types() {
    $result = array(
        'events' => event_list(),
        'event_types' => event_type_list(),
        'user_status' => user_status(),
    );
    return $result;
}

function render_shortcode() {

    $Content = <<<CONTENT
        <div class="civi-react-events" id="civi-react-events">
            <h3>Loading...</h3>
        <div>
    CONTENT;

    return $Content;
}

add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\enqueue_scripts' );

/**
 * Enqueue scripts and styles.
 *
 * @return void
 */
function enqueue_scripts() {
    wp_enqueue_style( 'civi_react_events-style', plugin_dir_url( __FILE__ ) . 'build/index.css' );
    // wp_enqueue_style( 'civi-react-events-react-bootstrap-style', plugin_dir_url( __FILE__ ) . 'node_modules/bootstrap/dist/css/bootstrap.min.css' );
    wp_enqueue_script( 'civi_react_events-script', plugin_dir_url( __FILE__ ) . 'build/index.js', array( 'wp-element' ), '1.0.0', true );
    wp_localize_script( 'civi_react_events-script', 'my_ajax_object', array( 'ajax_url' => admin_url( 'admin-ajax.php' ) ) );

}
