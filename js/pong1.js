var canvas,
    gl,
    aVertexPositionId,
    buffer,
    vertexShader, fragmentShader, shaderProgram,
    VSHADER_SOURCE = "attribute vec2 aVertexPosition;"
        + "attribute vec4 aColor;"
        + "varying vec4 vColor;"
        + "void main() {"
        + "     vec4 position = vec4(aVertexPosition, .0, 1.0);"
        + "     gl_Position = position;"
        + "     vColor = aColor;"
        + "}",
    FSHADER_SOURCE = "precision mediump float;"
        + "varying vec4 vColor;"
        + "void main() {"
        + "     gl_FragColor = vColor;"
        + "}",
    aColorLocation,
    startTime = null,
    time,
    deltaY = 0,
    objects = [],
    speed = [],
    objectsNumber = 50,
    numberVisible = 0,
    waitTime = 200,
    visibleCounter=20;
;

var requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

window.addEventListener("resize", resize);


function startup() {
    initObjects();
    canvas = document.getElementById("gameCanvas");
    gl = createGLContext();
    initShaders();
    gl.useProgram(shaderProgram);
    setupAttributes();
    setupBuffer();
    initGL();
    resize();
    requestAnimationFrame(animate);
}

function createGLContext() {
    return canvas.getContext("webgl") || alert("Failed to create GL context");
}

function draw() {
    gl.drawArrays(gl.TRIANGLE_STRIP,
        0,
        4
    );
}

function setupAttributes() {
    aVertexPositionId = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    aColorLocation = gl.getAttribLocation(shaderProgram, "aColor");
    //colorLocation = gl.getUniformLocation(shaderProgram, "uColor");
}

function setupBuffer() {
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
}

function addBuffer(vertices) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
    );
}

function initShaders() {
    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    shaderProgram = gl.createProgram();

    gl.shaderSource(vertexShader, VSHADER_SOURCE);
    gl.compileShader(vertexShader);

    gl.shaderSource(fragmentShader, FSHADER_SOURCE);
    gl.compileShader(fragmentShader);

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert("Shader Error: " + gl.getShaderInfoLog(vertexShader));
        return;
    }

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert("Shader Error: " + gl.getShaderInfoLog(fragmentShader));
        return;
    }

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Shader Error: " + gl.getShaderInfoLog(shaderProgram));
        return;
    }
}


function initGL() {
    gl.clearColor(.608, .102, .314, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.vertexAttribPointer(
        aVertexPositionId,
        2,
        gl.FLOAT,
        false,
        24, // 6 x Float (4 Byte)
        0
    );

    gl.vertexAttribPointer(
        aColorLocation,
        4,
        gl.FLOAT,
        false,
        24,
        8
    );

    gl.enableVertexAttribArray(aVertexPositionId);
    gl.enableVertexAttribArray(aColorLocation);

}

function animate(highResTimestamp) {
    if (time == undefined) {
        time = new Date().getTime();
    } else {
        time = highResTimestamp;
    }

    if (startTime == null) {
        startTime = time;
    }

    var progress = time - startTime;

    if (progress >= 10) {
        if(visibleCounter >= getRandom(150)){
            if(numberVisible<objectsNumber)
                numberVisible += 1;
            visibleCounter = 0;
        }

        gl.clear(gl.COLOR_BUFFER_BIT);

        startTime = time;
        deltaY -= .01;

        if (deltaY < -1.8) {
            console.log("down");
            deltaY = 0;
        }

        calcDelta();
        drawRect();
        visibleCounter+=1;
    }
    requestAnimationFrame(animate);
}

function drawRect() {
    for(var i = 0; i<=numberVisible;i++){
        addBuffer(objects[i]);
        draw();
    }
}

function calcDelta() {
    for (var i = 0; i <= numberVisible; i++) {
        for (var x = 1; x < objects[i].length; x = x + 6) {
            objects[i][x] -= speed[i];
        }
        if(objects[i][1] < -1){
            objects.splice(i,1);
            objects.push(createObject());
        }
    }
}

function getRandom(multpl) {
    return Math.random() * multpl;
}

function initObjects() {
    for (var i = 0; i <= objectsNumber; i++) {
        objects.push(createObject());
        console.log(objects[i]);
    }
}

function createObject() {
    var randomDeltaX = getRandom(2);
    var randomSize = .01 + getRandom(.1);

    var randomAlpha = .85 + getRandom(.14);

    speed.push(getRandom(1.005));

    return ([
        -1 + randomDeltaX, 1, .608, .102, .314, randomAlpha,
        -1 + randomSize + randomDeltaX, 1, .608, .102, .314, randomAlpha,
        -1 + randomDeltaX, 1 - randomSize, .608, .102, .314, randomAlpha,
        -1 + randomSize + randomDeltaX, 1 - randomSize, .608, .102, .314, randomAlpha,
    ]);
}

function resize() {
    // Get the canvas from the WebGL context
    var canvas = gl.canvas;

    // Lookup the size the browser is displaying the canvas.
    var displayWidth = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    if (canvas.width != displayWidth ||
        canvas.height != displayHeight) {

        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;

        // Set the viewport to match
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}