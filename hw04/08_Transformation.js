import { resizeAspectRatio, setupText, updateText, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

let isInitialized = false;
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let axesVAO;
let cubeVAO;
let sunVAO, earthVAO, moonVAO;
let sunTransform;


let earthTransform;
let moonTransform;
let rotationAngle = 0;
let currentTransformType = null;
let lastTime = 0;
let textOverlay; 

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main().then(success => {
        if (!success) {
            console.log('프로그램을 종료합니다.');
            return;
        }
        isInitialized = true;
        requestAnimationFrame(sunanimate);
    }).catch(error => {
        console.error('프로그램 실행 중 오류 발생:', error);
    });
});

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.3, 0.4, 1.0);
    
    return true;
}

function setupAxesBuffers(shader) {
    axesVAO = gl.createVertexArray();
    gl.bindVertexArray(axesVAO);

    const axesVertices = new Float32Array([
        -0.8, 0.0, 0.8, 0.0,  // x축
        0.0, -0.8, 0.0, 0.8   // y축
    ]);

    const axesColors = new Float32Array([
        1.0, 0.3, 0.0, 1.0, 1.0, 0.3, 0.0, 1.0,  // x축 색상
        0.0, 1.0, 0.5, 1.0, 0.0, 1.0, 0.5, 1.0   // y축 색상
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, axesVertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, axesColors, gl.STATIC_DRAW);
    shader.setAttribPointer("a_color", 4, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
}

function setupCubeBuffers(shader, colorArray) {
    const cubeVertices = new Float32Array([
        -0.1,  0.1,  // 좌상단
        -0.1, -0.1,  // 좌하단
         0.1, -0.1,  // 우하단
         0.1,  0.1   // 우상단
    ]);

    const indices = new Uint16Array([
        0, 1, 2,    // 첫 번째 삼각형
        0, 2, 3     // 두 번째 삼각형
    ]);

    const cubeColors = new Float32Array(colorArray);

    cubeVAO = gl.createVertexArray();
    gl.bindVertexArray(cubeVAO);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);
    shader.setAttribPointer("a_color", 4, gl.FLOAT, false, 0, 0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    return cubeVAO;
}

function setupAllCubeVAOs(shader) {
    sunVAO = setupCubeBuffers(shader, [
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0
    ]);

    earthVAO = setupCubeBuffers(shader, [
        0.0, 1.0, 1.0, 1.0,
        0.0, 1.0, 1.0, 1.0,
        0.0, 1.0, 1.0, 1.0,
        0.0, 1.0, 1.0, 1.0
    ]);

    moonVAO = setupCubeBuffers(shader, [
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0
    ]);
}

function getTransformMatrices() {
    const T_sun = mat4.create();
    const R_sun = mat4.create();
    const S_sun = mat4.create();
    mat4.scale(S_sun, S_sun, [1, 1, 1]);
    mat4.rotate(R_sun, R_sun, rotationAngle, [0, 0, 1]);
    
    // 태양 변환 행렬
    sunTransform = mat4.create();
    mat4.multiply(sunTransform, S_sun, sunTransform);
    mat4.multiply(sunTransform, T_sun, sunTransform);
    mat4.multiply(sunTransform, R_sun, sunTransform);

    // 지구 변환 행렬
    const earthOrbitRadius = 0.7;
    const T_earth = mat4.create();
    const R_earth = mat4.create();
    const S_earth = mat4.create();
    mat4.rotate(R_earth, R_earth, rotationAngle * 4, [0, 0, 1]);
    mat4.scale(S_earth, S_earth, [0.5, 0.5, 1]);
    mat4.translate(T_earth, T_earth, 
        [
        earthOrbitRadius * Math.cos(rotationAngle * 2/3),
        earthOrbitRadius * Math.sin(rotationAngle * 2/3),
        0
        ]);


    earthTransform = mat4.create();
    mat4.multiply(earthTransform, S_earth, earthTransform);
    mat4.multiply(earthTransform, R_earth, earthTransform);
    mat4.multiply(earthTransform, T_earth, earthTransform);

    // 달 변환 행렬
    const moonOrbitRadius = 0.2;
    const T_moon = mat4.create();
    const R_moon = mat4.create();
    const S_moon = mat4.create();
    mat4.translate(T_moon, T_moon,
        [
        moonOrbitRadius * Math.cos(rotationAngle * 8),
        moonOrbitRadius * Math.sin(rotationAngle * 8),
        0
        ]);
    mat4.rotate(R_moon, R_moon, rotationAngle * 4, [0, 0, 1]);
    mat4.scale(S_moon, S_moon, [0.25, 0.25, 1]);

    moonTransform = mat4.create();
    mat4.multiply(moonTransform, S_moon, moonTransform);
    mat4.multiply(moonTransform, R_moon, moonTransform);
    mat4.multiply(moonTransform, T_moon, moonTransform);
    mat4.multiply(moonTransform, T_earth, moonTransform);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    shader.use();

    // 축 그리기
    shader.setMat4("u_transform", mat4.create());
    gl.bindVertexArray(axesVAO);
    gl.drawArrays(gl.LINES, 0, 4);

    // 태양 그리기
    shader.setMat4("u_transform", sunTransform);
    gl.bindVertexArray(sunVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    // 지구 그리기
    shader.setMat4("u_transform", earthTransform);
    gl.bindVertexArray(earthVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    // 달 그리기
    shader.setMat4("u_transform", moonTransform);
    gl.bindVertexArray(moonVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

function sunanimate(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    rotationAngle += Math.PI * 0.25 * deltaTime;
    getTransformMatrices();
    render();
    requestAnimationFrame(sunanimate);
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL 초기화 실패');
        }

        sunTransform = mat4.create();
        
        shader = await initShader();
        setupAxesBuffers(shader);
        setupAllCubeVAOs(shader);
        shader.use();
        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}
