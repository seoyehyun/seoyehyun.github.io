const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

// Set canvas size
canvas.width = 500;
canvas.height = 500;

// Initialize WebGL settings: viewport and clear color
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.1, 0.2, 0.3, 1.0);

// Scissor Test 활성화
gl.enable(gl.SCISSOR_TEST);

// Start rendering
render();

function render() { 
    var w = canvas.width / 2;
    var h = canvas.height / 2;  
    // Draw something here

    // 1사분면
    gl.viewport(w, h, w, h);
    gl.scissor(w, h, w, h);
    gl.clearColor(0, 1, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 2사분면
    gl.viewport(0, h, w, h);
    gl.scissor(0, h, w, h);
    gl.clearColor(1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 3사분면
    gl.viewport(0, 0, w, h);
    gl.scissor(0, 0, w, h);
    gl.clearColor(0, 0, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 4사분면
    gl.viewport(w, 0, w, h);
    gl.scissor(w, 0, w, h);
    gl.clearColor(1, 1, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

// 초기 렌더링
render();

// 창 크기 변경 시 다시 그리기
window.addEventListener('resize', () => {

    let minLength = innerWidth;
    if (window.innerHeight < window.innerWidth) {minLength = window.innerHeight;}
    if (window.innerWidth < window.innerHeight) {minLength = window.innerWidth;}
    
    canvas.width = minLength;
    canvas.height = minLength;
    gl.viewport(0, 0, canvas.width, canvas.height);
    render();
});
