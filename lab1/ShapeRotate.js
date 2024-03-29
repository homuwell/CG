'use strict'
let canvas = document.getElementById('content');

let ctx = canvas.getContext('2d');
ctx.translate(canvas.width / 2, canvas.height / 2);
let triangle = new Triangle();
let point = new Point();



function Triangle() {
    this.triangle = [];
    this.triangle[0] = {x: 0, y: 0};
    this.triangle[1] = {x: 0, y: 50};
    this.triangle[2] = {x: 100, y: 0};
    this.deg = 0;
    this.new_triangle = this.triangle;

    this.draw = (color,fill) => {
        ctx.strokeStyle = color;
        ctx.fillStyle = fill;
        ctx.beginPath();
        if (color !== 'white' && fill !== 'white') {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        }
        for (let i = 0; i < this.triangle.length; i++) {

            if (i === 0) {
                ctx.moveTo(this.triangle[i].x, -this.triangle[i].y);
            } else {
                ctx.lineTo(this.triangle[i].x, -this.triangle[i].y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        if (color !== 'white' && fill !== 'white') {
            ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        }
        ctx.beginPath();
        for (let i = 0; i < this.new_triangle.length; i++) {

            if (i === 0) {
                ctx.moveTo(this.new_triangle[i].x, -this.new_triangle[i].y);
            } else {
                ctx.lineTo(this.new_triangle[i].x, -this.new_triangle[i].y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }
    this.rotate = () => {
        let deg = +document.getElementById('deg').value;
        let rad = (Math.PI / 180) * deg;
        let radCurr = this.deg - rad;
        let x = +document.getElementById('x').value;
        let y = +document.getElementById('y').value;
        ctx.lineWidth = 4;
        this.draw('white','white');
        ctx.lineWidth = 2;
        this.triangle = this.new_triangle;
        this.new_triangle = this.triangle.map((i) => {
            let x_n = x + (i.x - x) * Math.cos(radCurr) - (i.y - y) * Math.sin(radCurr);
            let y_n = y + (i.x - x) * Math.sin(radCurr) + (i.y - y) * Math.cos(radCurr);
            return {x:x_n, y:y_n};
        });
        this.deg = rad;

        this.draw('black', 'rgba(0,0,0,0.2)');
        point.draw();
    }
    this.changeRect = () => {
        ctx.lineWidth = 4;
        this.draw('white','white');
        ctx.lineWidth = 2;
        this.triangle = this.new_triangle;
        this.deg = 0;
    }
    ctx.lineWidth = 2;
    this.draw('black','rgba(0,0,0,0.2)');
}

function Point() {
    this.x = 0;
    this.y = 0;
    this.draw = () => {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x, -this.y, 5, 0, 2 * Math.PI );
        ctx.closePath();
        ctx.fill();
    }
    this.update = () => {
        ctx.clearRect(this.x - 5 ,-this.y - 5, 20, 20);
        this.x = +document.getElementById('x').value;
        this.y = +document.getElementById('y').value;
        document.getElementById('deg').value = 0;
        triangle.changeRect();
        triangle.draw('white','white');
        triangle.draw('black','rgba(0,0,0,0.2)');
        this.draw();

    }
    this.draw();
}
