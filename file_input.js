$(function() {
    var App = {
        init: function() {
            App.attachListeners();
        },
        attachListeners: function() {
            var self = this;

            $("input[type=file]").on("change", function(e) {
                if (e.target.files && e.target.files.length) {
                    console.log("result", e.target.files[0]);
                    App.decode(URL.createObjectURL(e.target.files[0]));
                }
            });
        },
        decode: function(src) {
            Quagga.decodeSingle({
                decoder: {
                    readers: ["code_128_reader",
                              "ean_reader",
                              "ean_8_reader",
                              "code_39_reader",
                              "code_39_vin_reader",
                              "codabar_reader",
                              "upc_reader",
                              "upc_e_reader",
                              "i2of5_reader"]
                },
                locate: true, // try to locate the barcode in the image
                src: src
            }, function(result){
                if(result.codeResult) {
                    console.log("result", result.codeResult.code);
                } else {
                    console.log("not detected");
                }
            });
        },
        state: {
            inputStream: {
                size: 800,
                singleChannel: false
            },
            locator: {
                patchSize: "medium",
                halfSample: true
            },
            decoder: {
                readers: [{
                    format: "code_128_reader",
                    config: {}
                }]
            },
            locate: true,
            src: null
        }
    };

    App.init();
});