<?php require_once('../auth/user.php'); ?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1" >

<meta http-equiv="cache-control" content="max-age=0" />
<meta http-equiv="cache-control" content="no-cache" />
<meta http-equiv="expires" content="0" />
<meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
<meta http-equiv="pragma" content="no-cache" />

<title>Login</title>
<link rel="stylesheet" href="/mobile/jqm/jquery.mobile-1.4.5.css" />
<link rel="stylesheet" href="/mobile/jqm/themes/CuPIDthemes.css" />
<link rel="stylesheet" href="/mobile/css/custom.css" />

<script src="/js/jquery-1.11.0.min.js"></script>
<script src="/js/jquery-migrate-1.2.1.min.js"></script>

<script src="/mobile/js/jqm-docs.js"></script>
<script src="/mobile/jqm/jquery.mobile-1.4.5.js"></script>

<script src="/js/iijslib.js" type="text/javascript"></script>
<script src="/js/cupidjslib.js" type="text/javascript"></script>


<body>
    <div data-role="content" class="ui-content-main" style="min-height:600px">
            <div role="main" class="ui-content content-secondary" style="margin-left:10px" id="content-one" data-theme="b">
                <?php $user->loginmobile_form(); ?>
            </div>
    </div>
</body>

</html>
