/*
 * This simulation uses the HTML5 canvas API.
 * Refer to this site https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
 */
let canvas = document.getElementById('canvas');


/*
 * ctx stands for context - Every drawing function call is based on this context
 * The below comment is a special type of comment which will inform VSCode about the type
 * of the variable. Here ctx is of type *CanvasRenderingContext2D*. This is optional adding
 * this will let have better autocomplete features. Without this you won't have proper
 * autocompletion when you do *ctx.*
 */
/** @type {CanvasRenderingContext2D} */
let ctx = canvas.getContext('2d');

let sampling_frequency_span = document.getElementById("Fs");
let wave_frequency_span = document.getElementById("Fm");
let wave_amplitude_span = document.getElementById("Am");
let delta_span = document.getElementById("Delta");
let vertical_scale_slider = document.getElementById("vertical_scale_factor");
let horizontal_scale_slider = document.getElementById("horizontal_scale_factor");
let unsampled_wave_checkbox = document.getElementById("unsampled_wave");
let sampled_points_checkbox = document.getElementById("sampled_points");
let staircase_wave_checkbox = document.getElementById("staircase_wave");

let canvas_width = window.screen.width-50;
let canvas_height = 600;
let orgx = 200;
let orgy = 315;

// Set resolution for canvas
canvas.width = canvas_width;
canvas.height = canvas_height;

let wave_amplitude_slider = document.getElementById("amplitude");
let wave_frequency_slider = document.getElementById("frequency");
let sampling_frequency_slider = document.getElementById("sampling_frequency");

let vertical_scaling_factor = vertical_scale_slider.value;
let horizontal_scaling_factor = horizontal_scale_slider.value;

let delta = 2 * Math.PI * wave_amplitude_slider.value * wave_frequency_slider.value / sampling_frequency_slider.value;

/*
 * This function will draw a point at location x, y
 */
function drawPoint(x, y) {
    var radius = 3.0;
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.stroke();
    ctx.fillStyle = 'black';
    ctx.lineWidth = 1;
    ctx.arc(x, y, radius*1.3, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.closePath();
}

// Draws the axes for the graph
function drawAxes() {
    ctx.beginPath();
    // Vertical line
    ctx.moveTo(orgx, 100);
    ctx.lineTo(orgx, 530);
    ctx.strokeStyle = "black";
    ctx.stroke();

    // Horizontal line
    ctx.moveTo(100, 510);
    ctx.lineTo(window.screen.width-100, 510);
    ctx.strokeStyle = "black";
    ctx.stroke();

    // Base line
    ctx.moveTo(orgx, orgy);
    ctx.lineTo(window.screen.width-100, orgy);
    ctx.strokeStyle = "black";
    ctx.stroke();

    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Amplitude", 100, 120, 90);
    ctx.fillText("Time", window.screen.width-200, 530, 70);
    ctx.closePath();

}

/*
 * Returns an array of values starting with value *start* ending
 * at value *stop* and with an increment of *step*.
 * xrange(1, 3, 0.5) will return [1, 1.5, 2, 2.5, 3]
 */
function xrange(start, stop, step) {
    var res = [];
    var i = start;
    while (i <= stop) {
        res.push(i);
        i += step;
    }
    return res;
}

/* This function takes an array as the argument and will the corresponding staircase/square wave for its
 * values.
 * For eg: if you pass arr = [0, 1, 0, 1, 1, 0]
 * You will get the following wave
 *     ____     _______
 * ___|    |___|       |_____
 */
function plotStairCase(arr) {
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.stroke();

    // Scale the values in the array for plotting
    // Eg: if arr = [1, 1, 2] and scaling factor is 10
    // then arr = [10, 10, 20]
    arr.forEach((_, idx) => {
        arr[idx] *= vertical_scaling_factor;
    });

    // Learn about moveTo from the docs
    ctx.moveTo(arr[0], orgy);

    // The below code is bit hard to explain through comments try going throught them
    // if you don't understand then i'll try explaining it.
    ctx.lineWidth = 1;

    var px = orgx;
    var py = arr[0];

    for (var i = 1; i < arr.length; i++) {
        var xoff = i * horizontal_scaling_factor;
        ctx.lineTo(xoff + orgx, orgy - py);
        ctx.lineTo(xoff + orgx, orgy - arr[i]);
        px = xoff;
        py = arr[i];
    }

    ctx.stroke();
    ctx.closePath();
}

// Will draw the sine wave starting from loc xOffset, yOffset
function plotSine(xOffset, yOffset) {
    var width = 1000;
    // Gets the wave's amplitude, frequency and sampling freq value.
    var amplitude = wave_amplitude_slider.value;
    var frequency = wave_frequency_slider.value;
    var Fs = sampling_frequency_slider.value;

    // Generates the values for the sine wave.
    var StopTime = 1;
    var dt = 1 / Fs;
    var t = xrange(0, StopTime + dt, dt);
    var x = [];
    t.forEach((val) => {
        x.push(amplitude * Math.sin(2 * Math.PI * frequency * val));
    });

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";

    // Draw the original sine wave.
    var idx = 0;
    if (unsampled_wave_checkbox.checked) {
        while (idx < width) {
            ctx.lineTo(xOffset + idx * horizontal_scaling_factor, yOffset - vertical_scaling_factor * x[idx]);
            idx++;
        }
    }
    ctx.stroke();
    ctx.save();


    // Draw the sampled wave (If you dnt understand what I mean by sampled wave just check the sampled wave option from the check box).
    delta = ((2 * Math.PI * amplitude * frequency) / Fs).toFixed(4);
    if (sampled_points_checkbox.checked) {
        var idx = 0;
        while (idx < width) {
            drawPoint(xOffset + idx * horizontal_scaling_factor, yOffset - vertical_scaling_factor * x[idx]);

            ctx.moveTo(xOffset + idx * horizontal_scaling_factor, yOffset - vertical_scaling_factor * x[idx])
            ctx.lineTo(xOffset + idx * horizontal_scaling_factor, orgy)
            ctx.stroke();
            idx++;
        }
    }

    // Don't worry about this calculation. This is basically DM calculation if u don't understand
    // this no issues, even I don't. Just converted mathematical equations to code.
    // I refered to this video: https://youtu.be/XHHrh-vyhcE
    var e = new Array(x.length);
    var eq = new Array(x.length);
    var xq = new Array(x.length);

    for (var i = 0; i < x.length; i++) {
        if (i == 0) {
            e[i] = x[i];
            eq[i] = delta * Math.sign(e[i]);
            xq[i] = parseFloat(eq[i].toFixed(2));
        } else {
            e[i] = x[i] - xq[i - 1]
            eq[i] = delta * Math.sign(e[i]);
            xq[i] = (eq[i] + xq[i - 1]);
        }
    }

    // Draw the stair case wave
    if (staircase_wave_checkbox.checked)
        plotStairCase(xq);
}

function drawGraph() {
    drawAxes();
    plotSine(orgx, orgy);
}

function draw() {
    // Clear the screen
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas_width, canvas_height);

    // Set values for the indicators.
    wave_amplitude_span.innerText = wave_amplitude_slider.value + ' V';
    wave_frequency_span.innerText = wave_frequency_slider.value + ' Hz';
    sampling_frequency_span.innerText = sampling_frequency_slider.value + ' Hz';
    delta_span.innerText = delta;
    vertical_scaling_factor = vertical_scale_slider.value;
    horizontal_scaling_factor = horizontal_scale_slider.value;

    drawGraph();

    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
