export class regularOctahedron {
    constructor(gl) {
        this.gl = gl;
        
        const h = Math.SQRT2 / 2;

        this.vertices = new Float32Array([
            // 위쪽 사각뿔
            -0.5, 0.0,  0.5,  // 0
             0.5, 0.0,  0.5,  // 1
             0.0, h,  0.0,  // 2 top vertex

             0.5, 0.0,  0.5,  // 3
             0.5, 0.0, -0.5,  // 4
             0.0, h,  0.0,  // 5 top

             0.5, 0.0, -0.5,  // 6
            -0.5, 0.0, -0.5,  // 7
             0.0, h,  0.0,  // 8 top

            -0.5, 0.0, -0.5,  // 9
            -0.5, 0.0,  0.5,  // 10
             0.0, h,  0.0,  // 11 top

            // 아래쪽 사각뿔 (y좌표 -0.5)
            -0.5, 0.0,  0.5,  // 12
             0.5, 0.0,  0.5,  // 13
             0.0, -h, 0.0,  // 14 bottom vertex

             0.5, 0.0,  0.5,  // 15
             0.5, 0.0, -0.5,  // 16
             0.0, -h, 0.0,  // 17 bottom

             0.5, 0.0, -0.5,  // 18
            -0.5, 0.0, -0.5,  // 19
             0.0, -h, 0.0,  // 20 bottom

            -0.5, 0.0, -0.5,  // 21
            -0.5, 0.0,  0.5,  // 22
             0.0, -h, 0.0   // 23 bottom
        ]);

        this.colors = new Float32Array([
            // 위쪽 (빨/노/보라/시안)
            ...Array(3).fill([1, 1, 1, 1]).flat(),
            ...Array(3).fill([1, 1, 1, 1]).flat(),
            ...Array(3).fill([1, 1, 1, 1]).flat(),
            ...Array(3).fill([1, 1, 1, 1]).flat(),

            // 아래쪽 (빨/노/보라/시안)
            ...Array(3).fill([1, 1, 1, 1]).flat(),
            ...Array(3).fill([1, 1, 1, 1]).flat(),
            ...Array(3).fill([1, 1, 1, 1]).flat(),
            ...Array(3).fill([1, 1, 1, 1]).flat(),
        ]);

        this.indices = new Uint16Array([
            // 위쪽
            0, 1, 2,
            3, 4, 5,
            6, 7, 8,
            9,10,11,
            // 아래쪽
            12,13,14,
            15,16,17,
            18,19,20,
            21,22,23
        ]);

        this.texCoords = new Float32Array([
            // front top
            0, 0.5, 0.25, 0.5, 0.5, 1,
            // right top
            0.25, 0.5, 0.5, 0.5, 0.5, 1,
            // back top
            0.5, 0.5, 0.75, 0.5, 0.5, 1,
            // left op
            0.75, 0.5, 1, 0.5, 0.5, 1,
            // front top
            0, 0.5, 0.25, 0.5, 0.5, 0,
            // right top
            0.25, 0.5, 0.5, 0.5, 0.5, 0,
            // back top
            0.5, 0.5, 0.75, 0.5, 0.5, 0,
            // left op
            0.75, 0.5, 1, 0.5, 0.5, 0,
         ]);
         
        

        // Buffer 설정
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        this.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.texCoords, gl.STATIC_DRAW);


        this.vertexCount = this.indices.length;
    }

    draw(shader) {
        const gl = this.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        shader.setAttribPointer('a_position', 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        shader.setAttribPointer('a_color', 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        shader.setAttribPointer('a_texcoord', 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0);
    }
}
