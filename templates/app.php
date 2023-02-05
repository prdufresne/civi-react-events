<?php

// namespace EOTBca\CiviReactEvents;

$events = \Civi\Api4\Event::get()
  ->addSelect('*')
  ->addOrderBy('start_date', 'ASC')
  ->setLimit(25)
  ->execute();

echo "<script type=\"application/json\" id=\"eventList\">";
echo json_encode($events);
echo "</script>";
?>

<div id="civi-react-events">
    <h2>Loading...</h2>
</div>
