/* global vis getScaleFreeNetwork */
var network = null;

        function p(data) {
            var container = document.getElementById('mynetwork');
            var options = {
                layout: {
                    hierarchical: {},
                },
            };
            console.log("starting layout");
            new vis.Network(container, data, options);
            console.log("layout complete");
        }
    
</head>

<body>
<h2>Hierarchical Layout</h2>

<div id="mynetwork"></div>

<script type="text/javascript" src="./demo.jsonp"></script>