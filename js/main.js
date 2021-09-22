let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

//var dFlag=true;

let sampling_frequency_element = document.getElementById("Fs");
let wave_frequency_element = document.getElementById("Fm");
let wave_amplitude_element = document.getElementById("Am");
let delta_element = document.getElementById("Delta");
let vertical_scale_element = document.getElementById("vertical_scale_factor");
let horizontal_scale_element = document.getElementById("horizontal_scale_factor");
let bl_scale_element = document.getElementById("bit_length_factor");
let bit_length_element = document.getElementById("BL");
let check_unsampled_wave = document.getElementById("unsampled_wave");
let check_sampled_points = document.getElementById("sampled_points");
let check_quantized_points = document.getElementById("quantized_points");
let check_staircase_wave = document.getElementById("staircase_wave");
let check_pcm_wave = document.getElementById("pcm_wave");

let canvas_width = window.screen.width-50;
let canvas_height = 600;
let orgx = 200;
let orgy = 315;


// Set resolution for canvas
canvas.width = canvas_width;
canvas.height = canvas_height;

let wave_amplitude = document.getElementById("amplitude");
let wave_frequency = document.getElementById("frequency");
let sampling_frequency = document.getElementById("sampling_frequency");

let vertical_scaling_factor = vertical_scale_element.value;
let horizontal_scaling_factor = horizontal_scale_element.value;

let delta = 2 * Math.PI * wave_amplitude.value * wave_frequency.value / sampling_frequency.value;

function drawPoint(ctx, x, y) {
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

function xrange(start, stop, step) {
    var res = [];
    var i = start;
    while (i <= stop) {
        res.push(i);
        i += step;
    }
    return res;
}

function plotStairCase(arr) {
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.stroke();
    ctx.moveTo(orgx, orgy);

    // Scale the values in the array for plotting
    arr.forEach((_, idx) => {
        arr[idx] *= vertical_scaling_factor;
    });

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

function plotSine(ctx, xOffset, yOffset) {
    var width = 1000;
    var amplitude = wave_amplitude.value;
    var frequency = wave_frequency.value;
    var Fs = sampling_frequency.value;
    var StopTime = 1;
    var dt = 1 / Fs; // sampling interval
    var t = xrange(0, StopTime + dt, dt); // generates a list of t values seperated by sampling interval

    var x = [];
    t.forEach((val) => {
        x.push(amplitude * Math.sin(2 * Math.PI * frequency * val));
    });

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";

    var idx = 0;
    if (check_unsampled_wave.checked) {
        while (idx < width) {
            ctx.lineTo(xOffset + idx * horizontal_scaling_factor, yOffset - vertical_scaling_factor * x[idx]);
            idx++;
        }
    }
    ctx.stroke();
    ctx.save();

    if (check_pcm_wave.checked)
        plotPcmWave(t,x,xOffset,yOffset);


    delta = ((2 * Math.PI * amplitude * frequency) / Fs).toFixed(4);
    if (check_sampled_points.checked) {
        var idx = 0;
        while (idx < width) {
            drawPoint(ctx, xOffset + idx * horizontal_scaling_factor, yOffset - vertical_scaling_factor * (check_quantized_points.checked ? Math.round(x[idx]) : x[idx]));

            ctx.moveTo(xOffset + idx * horizontal_scaling_factor, yOffset - vertical_scaling_factor * (check_quantized_points.checked ? Math.round(x[idx]) : x[idx]))
            ctx.lineTo(xOffset + idx * horizontal_scaling_factor, orgy)
            ctx.stroke();
            idx++;
        }
    }

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
    if (check_staircase_wave.checked)
        plotStairCase(xq);
}

function plotPcmWave(t,x,xOffset,yOffset)
{
    var bitLength=bl_scale_element.value;
    ctx.beginPath();
    ctx.strokeStyle = "darkgreen";
    ctx.stroke();
    ctx.moveTo(orgx, orgy);
    
    var binList=[]  // contains all of the binary coded words
    var quantizedList=[];
    var entireBinaryString = "";
    x.forEach((item)=>{
        quantizedList.push(Math.round(item));
        /////////////// EXPERIMENTAL ////////////////////
        //var temp=customBinaryFunc((check_quantized_points.checked ? Math.round(item) : item),wave_amplitude.value*2,bitLength);
        if(check_quantized_points.checked)
            var temp=customBinaryFunc(Math.round(item),wave_amplitude.value*2,bitLength);
        else
            var temp=d2b(item,bitLength);
        /////////////////////////////////////////////////
        binList.push(temp);
        entireBinaryString+=temp;
    });
    var binNumbList=[];
    for(var i=0;i<entireBinaryString.length;i++)
    {
        binNumbList.push(Number(entireBinaryString[i]));
    }
    if(dFlag)
    {
        console.log(quantizedList);
        console.log("bitLength=>",bitLength);
        console.log("binList=>",binList);
        console.log("binString=>",entireBinaryString);
        console.log("binNumbList=>",binNumbList);
        console.log("------------------------");
        dFlag=!dFlag;
    }
    var totalDivisions = x.length*bitLength;
    var idx = 0;
    while (idx < totalDivisions) {
        var bcx=binNumbList[idx];
        if(idx>0)
        {
            if((bcx==1)&&(binNumbList[idx-1]==0))
            {
                ctx.lineTo(xOffset + (idx) * horizontal_scaling_factor/bitLength, yOffset - 40 *0);
                ctx.stroke();
            }
        }
        if(idx>0)
        {
            if((bcx==0)&&(binNumbList[idx-1]==1))
            {
                ctx.lineTo(xOffset + (idx) * horizontal_scaling_factor/bitLength, yOffset - 40 *3);
                ctx.stroke();
            }
        }
        ctx.lineTo(xOffset + idx * horizontal_scaling_factor/bitLength, yOffset - 40 *3* bcx);
        ctx.stroke();
        idx++;
    }
    ///////////////////////
    ctx.closePath();
}

function drawGraph() {
    drawAxes();
    plotSine(ctx, orgx, orgy);
}

function draw() {
    // Clear the screen
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas_width, canvas_height);

    wave_amplitude_element.innerText = wave_amplitude.value*2 + ' V';
    wave_frequency_element.innerText = wave_frequency.value + ' Hz';
    sampling_frequency_element.innerText = sampling_frequency.value + ' Hz';
    delta_element.innerText = delta;
    vertical_scaling_factor = vertical_scale_element.value;
    horizontal_scaling_factor = horizontal_scale_element.value;
    bit_length_element.innerText = bl_scale_element.value;

    drawGraph();

    requestAnimationFrame(draw);
}

function d2b(x,bitLength=8)
{
    var result = "0000000000000000000000000"+(x >>> 0).toString(2);
    return(result.substr(result.length-bitLength));
}

function customBinaryFunc(x,amplitude,bitLength=8)
{
    var n=2;
    while(1)
    {
        if(Math.pow(2,n)>amplitude+1)
            break;
        else
            n+=1;
    }
    var quantizedAmpList=[]
    var equivalentBinList=[]
    var i=0;
    while(i<=Math.pow(2,n))
    {
        //quantizedAmpList.push(i);
        equivalentBinList.push(d2b(i,bitLength));
        i+=1;
    }
    var i = -1*Math.pow(2,n)/2;
    while(i<=Math.pow(2,n)/2)
    {
        quantizedAmpList.push(i);
        i+=1;
    }
    //console.log(quantizedAmpList);
    //console.log(equivalentBinList);
    //console.log(equivalentBinList[quantizedAmpList.indexOf(x)]);
    return(equivalentBinList[quantizedAmpList.indexOf(x)]);
}

requestAnimationFrame(draw);
