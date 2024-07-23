var canvas = document.getElementById("boidsCanvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var Vector = /** @class */ (function () {
    function Vector(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector.prototype.add = function (vector) {
        this.x += vector.x;
        this.y += vector.y;
    };
    Vector.prototype.sub = function (vector) {
        this.x -= vector.x;
        this.y -= vector.y;
    };
    Vector.prototype.mult = function (n) {
        this.x *= n;
        this.y *= n;
    };
    Vector.prototype.div = function (n) {
        this.x /= n;
        this.y /= n;
    };
    Vector.prototype.mag = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    Vector.prototype.normalize = function () {
        var m = this.mag();
        if (m !== 0) {
            this.div(m);
        }
    };
    Vector.prototype.limit = function (max) {
        if (this.mag() > max) {
            this.normalize();
            this.mult(max);
        }
    };
    return Vector;
}());
var Boid = /** @class */ (function () {
    function Boid() {
        this.position = new Vector(Math.random() * canvas.width, Math.random() * canvas.height);
        this.velocity = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
        this.acceleration = new Vector(0, 0);
        this.maxForce = 0.2;
        this.maxSpeed = 2;
    }
    Boid.prototype.edges = function () {
        if (this.position.x > canvas.width)
            this.position.x = 0;
        if (this.position.x < 0)
            this.position.x = canvas.width;
        if (this.position.y > canvas.height)
            this.position.y = 0;
        if (this.position.y < 0)
            this.position.y = canvas.height;
    };
    Boid.prototype.align = function (boids) {
        var perceptionRadius = 50;
        var steering = new Vector(0, 0);
        var total = 0;
        for (var _i = 0, boids_1 = boids; _i < boids_1.length; _i++) {
            var other = boids_1[_i];
            var d = Math.sqrt(Math.pow((other.position.x - this.position.x), 2) +
                Math.pow((other.position.y - this.position.y), 2));
            if (other !== this && d < perceptionRadius) {
                steering.add(other.velocity);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.normalize();
            steering.mult(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    };
    Boid.prototype.cohesion = function (boids) {
        var perceptionRadius = 50;
        var steering = new Vector(0, 0);
        var total = 0;
        for (var _i = 0, boids_2 = boids; _i < boids_2.length; _i++) {
            var other = boids_2[_i];
            var d = Math.sqrt(Math.pow((other.position.x - this.position.x), 2) +
                Math.pow((other.position.y - this.position.y), 2));
            if (other !== this && d < perceptionRadius) {
                steering.add(other.position);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.sub(this.position);
            steering.normalize();
            steering.mult(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    };
    Boid.prototype.separation = function (boids) {
        var perceptionRadius = 50;
        var steering = new Vector(0, 0);
        var total = 0;
        for (var _i = 0, boids_3 = boids; _i < boids_3.length; _i++) {
            var other = boids_3[_i];
            var d = Math.sqrt(Math.pow((other.position.x - this.position.x), 2) +
                Math.pow((other.position.y - this.position.y), 2));
            if (other !== this && d < perceptionRadius) {
                var diff = new Vector(this.position.x - other.position.x, this.position.y - other.position.y);
                diff.div(d);
                steering.add(diff);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.normalize();
            steering.mult(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    };
    Boid.prototype.flock = function (boids) {
        var alignment = this.align(boids);
        var cohesion = this.cohesion(boids);
        var separation = this.separation(boids);
        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
    };
    Boid.prototype.update = function () {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.acceleration.mult(0);
    };
    Boid.prototype.show = function () {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.stroke();
    };
    return Boid;
}());
var boids = [];
for (var i = 0; i < 1000; i++) {
    boids.push(new Boid());
}
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var _i = 0, boids_4 = boids; _i < boids_4.length; _i++) {
        var boid = boids_4[_i];
        boid.edges();
        boid.flock(boids);
        boid.update();
        boid.show();
    }
    requestAnimationFrame(animate);
}
animate();
