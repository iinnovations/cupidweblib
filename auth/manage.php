<?php require_once('user.php'); $user->require_login(); ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">

<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<meta http-equiv="Content-Language" content="en-us" />
	<title>Manage Account</title>
	<link rel="stylesheet" type="text/css" href="/css/login.css" />
</head>

<body>
	<div>
		<p>Manage Account</p>
<?php $user->account_form(); ?>
	</div>
</body>

</html>
