    var nodes = null;
    var edges = null;
    var network = null;
    var setSmooth = false;

    function destroy() {
      if (network !== null) {
        network.destroy();
        network = null;
      }
    }

    function draw() {
      destroy();
      var nodeCount = document.getElementById('nodeCount').value;
      if (nodeCount > 100) {
        document.getElementById("message").innerHTML =