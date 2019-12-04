<?php

//TEST
$config = array(

  'admin' => array(
    'core:AdminPassword',
  ),

  'example-userpass' => array(
    'exampleauth:UserPass',
    'test:test' => array(
      'uid' => array('1'),
      'org' => array('GE'),
      'dept' => array('NewsDigital'),
      'role' => array('admin'),
      'title' => array('Some Title'),
      'group' => array('news'),
      'email' => 'didarul@abcd.com',
    ),
    'user:11111' => array(
      'uid' => array('2'),
      'org' => array('MSNBC'),
      'dept' => array('newsdigital'),
      'role' => array('photo editor'),
      'title' => array('Photo Editor'),
      'group' => array('devops'),
      'email' => 'user1@somewhere.com',
    ),
  ),

);
