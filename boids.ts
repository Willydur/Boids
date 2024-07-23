const canvas = document.getElementById("boidsCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Vector {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(vector: Vector) {
    this.x += vector.x;
    this.y += vector.y;
  }

  sub(vector: Vector) {
    this.x -= vector.x;
    this.y -= vector.y;
  }

  mult(n: number) {
    this.x *= n;
    this.y *= n;
  }

  div(n: number) {
    this.x /= n;
    this.y /= n;
  }

  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const m = this.mag();
    if (m !== 0) {
      this.div(m);
    }
  }

  limit(max: number) {
    if (this.mag() > max) {
      this.normalize();
      this.mult(max);
    }
  }
}

class Boid {
  position: Vector;
  velocity: Vector;
  acceleration: Vector;
  maxForce: number;
  maxSpeed: number;

  constructor() {
    this.position = new Vector(
      Math.random() * canvas.width,
      Math.random() * canvas.height
    );
    this.velocity = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
    this.acceleration = new Vector(0, 0);
    this.maxForce = 0.2;
    this.maxSpeed = 2;
  }

  edges() {
    if (this.position.x > canvas.width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = canvas.width;
    if (this.position.y > canvas.height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = canvas.height;
  }

  align(boids: Boid[]) {
    let perceptionRadius = 50;
    let steering = new Vector(0, 0);
    let total = 0;
    for (let other of boids) {
      let d = Math.sqrt(
        (other.position.x - this.position.x) ** 2 +
          (other.position.y - this.position.y) ** 2
      );
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
  }

  cohesion(boids: Boid[]) {
    let perceptionRadius = 50;
    let steering = new Vector(0, 0);
    let total = 0;
    for (let other of boids) {
      let d = Math.sqrt(
        (other.position.x - this.position.x) ** 2 +
          (other.position.y - this.position.y) ** 2
      );
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
  }

  separation(boids: Boid[]) {
    let perceptionRadius = 50;
    let steering = new Vector(0, 0);
    let total = 0;
    for (let other of boids) {
      let d = Math.sqrt(
        (other.position.x - this.position.x) ** 2 +
          (other.position.y - this.position.y) ** 2
      );
      if (other !== this && d < perceptionRadius) {
        let diff = new Vector(
          this.position.x - other.position.x,
          this.position.y - other.position.y
        );
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
  }

  flock(boids: Boid[]) {
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0);
  }

  show() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.stroke();
  }
}

let boids: Boid[] = [];

for (let i = 0; i < 1000; i++) {
  boids.push(new Boid());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let boid of boids) {
    boid.edges();
    boid.flock(boids);
    boid.update();
    boid.show();
  }

  requestAnimationFrame(animate);
}

animate();
