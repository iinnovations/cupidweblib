cupidweblibs
=============================================

## Introduction

Interface Innovations libraries for web control of
This library is designed to be used in conjunction with cupidweblibs, for a web-enabled interface employing wsgi. cupidweblibs are not required, however, and control elements may be used without the web interface. Items required only for web elements and cupidweblibs are noted below. 

## Requirements:

A web server.

## Installation and Use

1. Copy files to /var/www
2. Ensure wsgi scripts are aliased in your site configuration. e.g.
     WSGIScriptAlias /wsgisqlitequery /usr/lib/iicontrollibs/wsgi/wsgisqlitequery.wsgi
3. Create wwwsafe directory in same directory as web directory and copy users.db into it. For example, for web directory of /var/www/, create /var/wwwsafe.
4. Ensure permissions are correct on database directories and files to allow modification. root:www-data 755 will work.
5. Ensure your server is properly configured to process wsgi directives. See iicontrollibs for details.

