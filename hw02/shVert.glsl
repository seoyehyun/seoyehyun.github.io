#version 300 es
precision mediump float;

layout(location = 0) in vec2 aPos;
uniform vec2 positionOffset;

void main() {
    gl_Position = vec4(aPos + positionOffset, 0.0, 1.0);
}
