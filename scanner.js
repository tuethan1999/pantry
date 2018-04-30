var _scannerIsRunning = false;

// Start/stop scanner
document.getElementById("btn").addEventListener("click", function() {
    if (_scannerIsRunning) {
        Quagga.stop();
    } else {
        startScanner();
    }
}, false);

function startScanner() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#scanner-container'),
            constraints: {
                width: 480,
                height: 320,
                facingMode: "environment"
            },
        },
        decoder: {
            readers: [
                "code_128_reader",
                "ean_reader",
                "ean_8_reader",
                "code_39_reader",
                "code_39_vin_reader",
                "codabar_reader",
                "upc_reader",
                "upc_e_reader",
                "i2of5_reader"
            ],
            debug: {
                showCanvas: true,
                showPatches: true,
                showFoundPatches: true,
                showSkeleton: true,
                showLabels: true,
                showPatchLabels: true,
                showRemainingPatchLabels: true,
                boxFromPatches: {
                    showTransformed: true,
                    showTransformedBox: true,
                    showBB: true
                }
            }
        },

    }, function (err) {
        if (err) {
            console.log(err);
            return
        }

        console.log("Initialization finished. Ready to start");
        Quagga.start();

        // Set flag to is running
        _scannerIsRunning = true;

        if (document.getElementById("button") == null) {
            // Create the cancel button
            var button = document.createElement("button");
            button.type = "button";
            button.id = "button";
            button.className = "btn btn-danger btn-lg";
            button.innerHTML = "Cancel Scanner";

            // Append to body of HTML
            var body = document.getElementsByTagName("body")[0];
            body.appendChild(button);

            // Add event handler
            button.addEventListener ("click", function() {
                Quagga.stop();
                _scannerIsRunning = false;
                document.getElementById("scanner-container").innerHTML = "";
                var elem = document.getElementById("button");
                elem.parentNode.removeChild(elem);
            });
        }
    });

    Quagga.onProcessed(function (result) {
        var drawingCtx = Quagga.canvas.ctx.overlay,
        drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
            }
        }
    });

    Quagga.onDetected(function (result) {
        Quagga.stop();
        _scannerIsRunning = false;
        var elem = document.getElementById("button");
        elem.parentNode.removeChild(elem);
        document.getElementById("scanner-container").innerHTML = "";
        console.log("Barcode detected and processed : [" + result.codeResult.code + "]");
        request = new XMLHttpRequest();

        // Step 2: Initialize HTTP POST request
        request.open("POST", "https://glacial-castle-75338.herokuapp.com/barcode", true);

        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        // Once request is fully loaded, parse through JSON string 
        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200) {
                result = request.responseText;
                $("#ingredients_list").prepend(entry);
            }
        }
        request.send("username=" + result.codeResult.code);
    });
}
