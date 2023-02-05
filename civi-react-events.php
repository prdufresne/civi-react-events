<?php
/**
 * Plugin Name:       CiviCRM React Event Plugin
 * Description:       Displays CiviCRM events in WordPress using React
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Paul dufresne
 * License:           MIT
 * License URI:       https://github.com/prdufresne/civi-react-events/blob/main/LICENSE
 * Text Domain:       civi_react_events
 */

add_action( 'admin_menu', 'civi_react_events_menu' );

/**
 * Init Admin Menu.
 *
 * @return void
 */
function civi_react_events_menu() {
    add_menu_page( __( 'Civi React Events', 'civi-react-events'), __( 'Civi React Events', 'civi-react-events'), 'manage_options', 'civi-react-events', 'civi_react_events_admin_page', 'dashicons-admin-post', '2.1' );
}

/**
 * Init Admin Page.
 *
 * @return void
 */
function civi_react_events_admin_page() {
    require_once plugin_dir_path( __FILE__ ) . 'templates/app.php';
}

add_action( 'admin_enqueue_scripts', 'civi_react_events_admin_enqueue_scripts' );

/**
 * Enqueue scripts and styles.
 *
 * @return void
 */
function civi_react_events_admin_enqueue_scripts() {
    wp_enqueue_style( 'civi_react_events-style', plugin_dir_url( __FILE__ ) . 'build/index.css' );
    wp_enqueue_style( 'react-bootstrap-style', plugin_dir_url( __FILE__ ) . 'node_modules/bootstrap/dist/css/bootstrap.min.css' );
    wp_enqueue_script( 'civi_react_events-script', plugin_dir_url( __FILE__ ) . 'build/index.js', array( 'wp-element' ), '1.0.0', true );
}
