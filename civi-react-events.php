<?php
/**
 * Plugin Name:       CiviCRM React Event Plugin
 * Description:       Displays CiviCRM events in WordPress using React
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.7.0
 * Author:            Paul Dufresne
 * License:           MI
 * License URI:       https://github.com/prdufresne/civi-react-events/blob/main/LICENSE
 * Text Domain:       civi_react_events
 */

namespace CiviReactEvents;

// add_action( 'admin_menu', __NAMESPACE__ . 'admin_page' );
add_shortcode('civi-react-events', __NAMESPACE__ . '\render_shortcode');
add_shortcode('civi-simple-calendar', __NAMESPACE__.'\simple_calendar');
add_action( 'wp_ajax_civi_react_events', __NAMESPACE__ . '\user_action' );
add_action( 'wp_ajax_nopriv_civi_react_events', __NAMESPACE__ . '\non_user_action' );

function console_log($label, $output, $with_script_tags = true) {
    $js_code = 'console.log("' . $label .'",' . json_encode($output, JSON_HEX_TAG) . ');';
    if ($with_script_tags) {
        $js_code = '<script>' . $js_code . '</script>';
    }
    echo $js_code;
}

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
    ->addSelect('(contact_id.display_name) AS name', 'role_id:label', 'status_id:label',
        '(contact_id.Vehicle.Make) AS make', '(contact_id.Vehicle.Model) AS model',
        '(contact_id.Vehicle.Imported_Year) AS vehicle_year', '(contact_id.Vehicle.License_Plate) AS license_plate'
    )
    ->addWhere('event_id', '=', $event_id)
    ->addOrderBy('status_id', 'ASC')    // Show registered first, cancelled last
    ->addOrderBy('role_id', 'DESC')     // Show Trail Leaders first
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
        $events[$index]['style'] = str_replace(' ', '-', $event['event_type_id:label']);
        $index++;
    }

    return $events;
}

function events_and_types() {
    $ical_link = \CRM_Utils_System::url( 'civicrm/event/ical' );

    $result = array(
        'events' => event_list(),
        'event_types' => event_type_list(),
        'user_status' => user_status(),
        'ical_link' => $ical_link,
    );
    return $result;
}

function event_register($event_id, $role = 'Attendee') {
    $user_status = user_status();
    $result = null;
    $event_id = intval($event_id);
    $did_register = false;

    if($user_status['is_trail_leader']) {
        $role = 'Trail Leader';
    }

    if($user_status['is_member']) {
        $is_registered = \Civi\Api4\Participant::get(FALSE)
            ->addSelect('id', 'status_id:label')
            ->addWhere('event_id', '=', $event_id)
            ->addWhere('contact_id', '=', 'user_contact_id')
            ->execute()
            ->first();

        if($is_registered == null ) {
            $result = \Civi\Api4\Participant::create(FALSE)
                ->addValue('contact_id', 'user_contact_id')
                ->addValue('event_id', $event_id)
                ->addValue('role_id:label', [
                    $role,
                ])
                ->execute();
            $did_register = true;
        } elseif ($is_registered['status_id:label'] == 'Cancelled') {
            $results = \Civi\Api4\Participant::update()
                ->addValue('status_id:label', 'Registered')
                ->addValue('role_id:label', [
                    $role,
                ])
                ->addWhere('id', '=', $is_registered['id'])
                ->execute();
            $did_register = true;
        } else {
            $result = "Oh no, Mr Bill!";
        }

        if($did_register) {
            $event = \Civi\Api4\Event::get(FALSE)
                ->addSelect('title', 'description')
                ->addWhere('id', '=', $event_id)
                ->execute()
                ->first();

            $user_details = \Civi\Api4\Contact::get(FALSE)
                ->addSelect('display_name', '(email_primary.email) AS email')
                ->addWhere('id', '=', 'user_contact_id')
                ->execute()
                ->first();

            $mail_parameters = array(
                'from' => "Eastern Ontario Trail Blazers <admin@eotb.ca>",
                'toName' => $user_details['display_name'],
                'toEmail' => $user_details['email'],
                'subject' => "Event Registration " . $event['title'],
                'html' => $event['description'],
            );

            $email_sent = \CRM_Utils_Mail::send($mail_parameters);

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

function simple_calendar($user_atts = [], $content = null, $tag = '') {
    
	// Normalize attribute keys to lowercase
	$user_atts = array_change_key_case( (array) $user_atts, CASE_LOWER );

    //Add default attributes and override with user attributes
    $atts = shortcode_atts(
        array(
            'showheader' => 1,
            'header' => 'Upcoming Events',
            'showical' => 1,
            'limit' => 0,
            'widget' => 0,
        ), $user_atts, $tag
    );

    $styleModifier = $atts['widget'] == 1 ? 'widget' : '';

    // Open calendar object
    $Content = "<a href=\"$url\">";
    $Content .= "<div id=\"$syleModifier\" class=\"civi-react-events\">";

    // Add header
    if($atts['showheader'] > 0) {
        $header = $atts['header'];
        $headerClass = $atts['widget'] == 1 ? "widget-title" : "";
	    $Content .= "    <h3 class=\"$headerClass\">$header</h3>";
    }

    // Get events starting today or after ordered by start date
    $eventList = \Civi\Api4\Event::get(FALSE)
        ->addSelect('*', 'event_type_id:label', 'registration_link_text')
        ->addOrderBy('start_date', 'ASC')
        ->addOrderBy('end_date', 'ASC')
        ->addWhere('start_date', '>=', date('Y-m-d'))
        ->setLimit($atts['limit'])
        ->execute();
    $currentMonth = "";

    foreach ( $eventList as $event ) {
        $title = $event['title'];
        $summary = $event['summary'];
        $typeLabel = $event['event_type_id:label'];
        $id = $event['id'];
        $url = \CRM_Utils_System::url( 'civicrm/event/info', "reset=1&id=$id" );

        $startString = $event['start_date'];
        $start = date_create_from_format('Y-m-d H:i:s',$startString);
        $startMonth = date_format($start, 'F');
        $startDay = date_format($start, 'j');
        $startWeekday = date_format($start, 'l');

        // Check for an end date then validate if this is a multi-day event.
        $endString = $event['end_date'];
        $multiday = false;
        if($endString != null ) {
            $end = date_create_from_format('Y-m-d H:i:s',$endString);
            $endMonth = date_format($end, 'F');
            $endDay = date_format($end, 'j');
            $endWeekday = date_format($end, 'l');

            $startDate = explode(" ", $startString)[0];
            $endDate = explode(" ", $endString)[0];
            $multiday = $startDate != $endDate;
        }

        // Insert a monthly header 
        if ($startMonth != $currentMonth) {
            $currentMonth = $startMonth;
            $Content .= "<h3>$startMonth</h3>";
        }

        // Start the event row (we use a complete table for each event for formatting reasons);
        $row = "<div class=\"civi-react-events-event $typeLabel\">";
        
        // Add the date block

        $dateStyle = "";
        $dayString = $startDay;
        $weekdayString = $startWeekday;

        // If the start day and end day are different, this is a multi-day event.
        if ($multiday) {
            $dateStyle ="multiday";
            $dayString .=  "-".$endDay;
            $weekdayString = date_format($start, 'D')."-".date_format($end, 'D');
        }

        $row .= "<div class=\"civi-react-events-cell-date\">";
        $row .= "    <div class=\"civi-react-events-weekday\">$weekdayString</div>";
        $row .= "    <div class=\"civi-react-events-day $dateStyle\">$dayString</div>";
        $row .= "</div>";
        $row .= "<div class=\"civi-react-events-title\">$title</div>";
        $row .= "<div class=\"civi-react-events-description\">$summary</div>";

        // Close Row

        $row .= "</div>";

        $Content .= $row;
    }

    // Close calendar object

    $Content .= "</div>";
    $Content .= "</a>";

    return $Content;
}

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
