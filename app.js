var port = process.env.PORT || 3000,
    http = require('http'),
    fs = require('fs');

// Read the HTML as text
var html = fs.readFileSync('index.html', 'utf8');

// Read the environment from Elastic Beanstalk
var environment = process.env.APP_ENV || 'DEVELOPMENT';

// Customize the page based on the environment
if (environment.toUpperCase() === 'PRODUCTION') {

    html = html.replace(
        '<div class="value environment">DEVELOPMENT</div>',
        '<div class="value environment">PRODUCTION</div>'
    );

    html = html.replace(
        '<strong>Production Deployment Requires Approval</strong>',
        '<strong>Production Deployment Complete</strong>'
    );

    html = html.replace(
        'This release must receive manual approval before\n                it can be promoted to production.',
        'This release has been approved and successfully promoted to production.'
    );
}

var log = function(entry) {
    fs.appendFileSync(
        '/tmp/sample-app.log',
        new Date().toISOString() + ' - ' + entry + '\n'
    );
};

var server = http.createServer(function (req, res) {
    if (req.method === 'POST') {
        var body = '';

        req.on('data', function(chunk) {
            body += chunk;
        });

        req.on('end', function() {
            if (req.url === '/') {
                log('Received message: ' + body);
            } else if (req.url === '/scheduled') {
                log(
                    'Received task ' +
                    req.headers['x-aws-sqsd-taskname'] +
                    ' scheduled at ' +
                    req.headers['x-aws-sqsd-scheduled-at']
                );
            }

            res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
            res.end();
        });
    } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(html);
        res.end();
    }
});

server.listen(port);

console.log(
    'Server running at http://127.0.0.1:' +
    port +
    '/ in ' +
    environment
);
