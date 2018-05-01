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
        if (document.getElementById("button") != null) {
            var elem = document.getElementById("button");
            elem.parentNode.removeChild(elem);
        }
        document.getElementById("scanner-container").innerHTML = "";
        console.log("Barcode detected and processed : [" + result.codeResult.code + "]");

        var request;
        request = new XMLHttpRequest();

        // Step 2: Initialize HTTP POST request
        request.open("POST", "https://glacial-castle-75338.herokuapp.com/barcode", true);

        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        // Once request is fully loaded, parse through JSON string 
        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200) {
                result = request.responseText;
                var element = document.getElementById("ingredients_list");
                if (element.getElementsByTagName('*').length == 0) {
                    $("#ingredients_list").append("<h3>List of Ingredients added</h3>");
                }
                // console.log("Result = " + result);
                $("#ingredients_list").append("<p>"+result+"</p>");

                if (element.getElementsByTagName('*').length == 2) {
                    var button2 = document.createElement("button");
                    button2.type = "button";
                    button2.id = "btn2";
                    button2.className = "btn btn-warning btn-sm";
                    button2.innerHTML = "Submit";
                    var body1 = document.getElementsByTagName("body")[0];
                    body1.appendChild(button2);

                    button2.addEventListener ("click", function() {
                        var myNo = document.getElementById("ingredients_list");
                        firstChild = myNo.firstChild;
                        while (myNo.firstChild) {
                            myNo.removeChild(myNo.firstChild);
                        }
                        var elem2 = document.getElementById("btn2");
                        elem2.parentNode.removeChild(elem2);

                        object = {name: result, quantity: 1, unit: "ct", expiration: "NA"};

                        var keyval = {
                            ingredients: [{"name": result, "quantity": 1, "unit": "ct", "expiration": "NA"}]
                        };
                        // var arr = [];
                        // arr.push(object);
                        // keyval['ingredients']= arr;

                        var request2;
                        request2 = new XMLHttpRequest();

                        // Initialize HTTP POST request
                        request2.open("POST", "https://glacial-castle-75338.herokuapp.com/ingredients", true);

                        request2.setRequestHeader("Content-type", "application/json");

                        request2.onreadystatechange = function() {
                            if (request2.readyState == 4 && request2.status == 200) {
                                result2 = request2.responseText;
                                console.log(result2);
                            }
                        }
                        request2.send(JSON.stringify(keyval));


                        var request3;
                        request3 = new XMLHttpRequest();

                        // Initialize HTTP POST request
                        request3.open("GET", "https://glacial-castle-75338.herokuapp.com/recipes", true);

                        request3.onreadystatechange = function() {
                            if (request3.readyState == 4 && request3.status == 200) {
                                result30 = request3.responseText;
                                result3 = JSON.parse(result30);
                                htmldat = "";
                                htmldat += "<p>The Recipe is: "+result3.title+"</p>";
                                htmldat += "<p> You will need "+result3.readyInMinutes+" minutes to prepare</p>";
                                htmldat += "<p> The recipe will feed "+result3.servings+" guests</p>";
                                htmldat += "<p> Here's how you prepare it: "+result3.instructions+"</p>";
                            }

                            $("#recipes").append(htmldat);
                        }

                        request3.send();


                        // $("#recipes").append("<p>The Recipe is: Korean Fried Chicken</p><p>You will need 25 minutes to prepare</p><p>The recipe will feed 4 guests</p><p>Here's how you prepare it: Heat vegetable oil in a Dutch oven or large pot over medium high heat to 300 degrees F. Season chicken wings with salt and pepper, to taste. Working in batches, add the chicken wings to the Dutch oven, 5 or 6 at a time, and fry until light brown, about 2-3 minutes. Transfer to a paper towel-lined plate. Increase oil temperature to 350 degrees F. Add the chicken wings to the Dutch oven again and cook until golden brown and crispy, about 2 minutes on each side. Transfer to a paper towel-lined plate. Heat soy sauce and sugar in a small saucepan over medium high heat. Bring to a boil; reduce heat to low and simmer, stirring occasionally, until sauce has thickened, about 2-3 minutes. Serve wings immediately, tossed with soy sauce glaze.</p><p>The nutritional information is as follows:</p><p>Percentage Protein: 23.56%</p><p>Percentage Fat: 63.39%</p><p>Percentage Carbohydrates: 13.05%</p>");

                    });
                }
            }
        }
        request.send("barcode=" + result.codeResult.code);
    });
}
