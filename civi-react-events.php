<?php
/**
 * Plugin Name:       CiviCRM React Event Plugin
 * Description:       Displays CiviCRM events in WordPress using React
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.1
 * Author:            Paul Dufresne
 * License:           MI
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
            case 'register-for-event':
                $result = event_register($_POST["data"]);
                break;
            case 'deregister-from-event':
                $result = event_deregister($_POST["data"]);
                break;
            default:
                $result = array(
                    'message' => 'Invalid request',
                    'success' => false,
                );
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
            default:
                $result = array(
                    'message' => 'Invalid request',
                    'error' => true,
                );
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
    ->addSelect('(contact_id.display_name) AS name', 'role_id:label', 'status_id:label')
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
        ->setLimit(25)
        ->execute();

    $is_member = false;
    $is_executive = false;
    foreach($memberships as $membership) {
        if($membership['membership_type_id:label'] == 'Club Member' && in_array($membership['status_id:label'], $valid_status)) {
            $is_member = true;
        };
        if($membership['membership_type_id:label'] == 'Executive' && in_array($membership['status_id:label'], $valid_status)) {
            $is_executive = true;
        };
    };
    
    // $is_member = (count($memberships) > 0 && in_array($memberships[0]['status_id:label'], $valid_status) );

    $tags = \Civi\Api4\EntityTag::get(FALSE)
        ->addSelect('tag_id.name', 'entity_id')
        ->addWhere('entity_id', '=', $memberships[0]['contact_id'])
        ->addWhere('tag_id.name', '=', 'Trail Leader')
        ->execute();

    $result = array(
        // 'tags' => $tags,
        // 'memberships' => $memberships,
        'contact_id' => $memberships[0]['contact_id'],
        'is_member' => $is_member,
        'is_trail_leader' => ($is_member && (count($tags) > 0)),
        'is_executive' => $is_executive,
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
        ->addSelect('id', 'title', 'summary', 'start_date', 'end_date', 'event_type_id','event_type_id:label',
            'max_participants', 'is_online_registration', 'intro_text', 'confirm_title', 'confirm_text', 'description'
        )
        ->addWhere('start_date', '>=', date('Y-m-d'))
        ->addWhere('start_date', '<=', date('Y'). '-12-31')
        ->addChain('participants', \Civi\Api4\Participant::get(FALSE)
            ->addSelect('COUNT(id) AS count')
            ->addWhere('event_id', '=', '$id')
            ->addwhere('status_id:label', '=', 'Registered')
        )
        ->addChain('is_registered', \Civi\Api4\Participant::get(FALSE)
            ->addSelect('COUNT(id) AS count')
            ->addWhere('event_id', '=', '$id')
            ->addwhere('status_id:label', '=', 'Registered')
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

function event_register($event_id, $role = 'Attendee') {
    $user_status = user_status();
    $result = null;
    $event_id = intval($event_id);
    $did_register = false;

    if($user_status['is_member']) {
        $is_registered = \Civi\Api4\Participant::get(FALSE)
            ->addSelect('id', 'status_id:label')
            ->addWhere('event_id', '=', $event_id)
            ->addWhere('contact_id', '=', 'user_contact_id')
            ->execute();

        if(count($is_registered) == 0 ) {
            $result = \Civi\Api4\Participant::create(FALSE)
                ->addValue('contact_id', 'user_contact_id')
                ->addValue('event_id', $event_id)
                ->addValue('role_id:label', [
                    $role,
                ])
                ->execute();
            $did_register = true;
        } elseif ($is_registered[0]['status_id:label'] == 'Cancelled') {
            $results = \Civi\Api4\Participant::update()
                ->addValue('status_id:label', 'Registered')
                ->addWhere('id', '=', $is_registered[0]['id'])
                ->execute();
            $did_register = true;
        } else {
            $result = "Oh no, Mr Bill!";
        }

        if($did_register) {
            CRM_Activity_BAO_Activity::sendMessage(
                "Eastern Ontario Trail Blazers <admin@eotb.ca>",
                1,
                $user_status['contact_id'],
                "Event Registration",
                "",
                "<h2>Event Details</h2>",
            );
        }

    } else {
        $result = array(
            'role' => $role,
            'event_id' => $event_id,
            'user_status' => $user_status,
            'message' => 'This user is not a member',
            'error' => true,
        );
    };
    return $result;
}

function event_deregister($event_id, $role = 'Attendee') {
    $user_status = user_status();
    $result = null;
    $event_id = intval($event_id);

    $is_registered = \Civi\Api4\Participant::get(FALSE)
        ->addSelect('id', 'status_id:label')
        ->addWhere('event_id', '=', $event_id)
        ->addWhere('contact_id', '=', 'user_contact_id')
        ->execute();

    if(count($is_registered) > 0 && $is_registered[0]['status_id:label'] == 'Registered') {
        $results = \Civi\Api4\Participant::update()
            ->addValue('status_id:label', 'Cancelled')
            ->addWhere('id', '=', $is_registered[0]['id'])
            ->execute();
    } else {
        $result = array(
            'role' => $role,
            'event_id' => $event_id,
            'user_status' => $user_status,
            'message' => 'This user is not registered for this event',
            'error' => true,
        );
    };
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
