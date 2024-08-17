// Cross-browser requestAnimationFrame
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(callback) {
           window.setTimeout(callback, 1000 / 60); // Default to 60 FPS
         };
})();

function init(elemid) {
  const canvas = document.getElementById(elemid);
  const c = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  c.fillStyle = "rgba(30,30,30,1)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  return { c, canvas };
}

window.onload = function() {
  const { c, canvas } = init("canvas");
  let w = canvas.width;
  let h = canvas.height;
  const mouse = { x: false, y: false };
  const last_mouse = {};
  let target = { x: w / 2, y: h / 2 };
  let last_target = { x: target.x, y: target.y };
  let t = 0;
  const maxl = 300;
  const minl = 50;
  const n = 30;
  const numt = 500;
  const tent = [];
  let clicked = false;

  class Segment {
    constructor(parent, l, a, first) {
      this.first = first;
      if (first) {
        this.pos = { x: parent.x, y: parent.y };
      } else {
        this.pos = { x: parent.nextPos.x, y: parent.nextPos.y };
      }
      this.l = l;
      this.ang = a;
      this.updateNextPos();
    }
    updateNextPos() {
      this.nextPos = {
        x: this.pos.x + this.l * Math.cos(this.ang),
        y: this.pos.y + this.l * Math.sin(this.ang)
      };
    }
    update(t) {
      this.ang = Math.atan2(t.y - this.pos.y, t.x - this.pos.x);
      this.pos.x = t.x + this.l * Math.cos(this.ang - Math.PI);
      this.pos.y = t.y + this.l * Math.sin(this.ang - Math.PI);
      this.updateNextPos();
    }
    fallback(t) {
      this.pos = { x: t.x, y: t.y };
      this.updateNextPos();
    }
    show() {
      c.lineTo(this.nextPos.x, this.nextPos.y);
    }
  }

  class Tentacle {
    constructor(x, y, l, n) {
      this.x = x;
      this.y = y;
      this.l = l;
      this.n = n;
      this.rand = Math.random();
      this.segments = [new Segment(this, this.l / this.n, 0, true)];
      for (let i = 1; i < this.n; i++) {
        this.segments.push(new Segment(this.segments[i - 1], this.l / this.n, 0, false));
      }
    }
    move(last_target, target) {
      this.angle = Math.atan2(target.y - this.y, target.x - this.x);
      const dt = dist(last_target.x, last_target.y, target.x, target.y) + 5;
      const t = {
        x: target.x - 0.8 * dt * Math.cos(this.angle),
        y: target.y - 0.8 * dt * Math.sin(this.angle)
      };
      this.segments[this.n - 1].update(t);
      for (let i = this.n - 2; i >= 0; i--) {
        this.segments[i].update(this.segments[i + 1].pos);
      }
      if (dist(this.x, this.y, target.x, target.y) <= this.l + dt) {
        this.segments[0].fallback({ x: this.x, y: this.y });
        for (let i = 1; i < this.n; i++) {
          this.segments[i].fallback(this.segments[i - 1].nextPos);
        }
      }
    }
    show(target) {
      if (dist(this.x, this.y, target.x, target.y) <= this.l) {
        c.globalCompositeOperation = "lighter";
        c.beginPath();
        c.lineTo(this.x, this.y);
        for (let i = 0; i < this.n; i++) {
          this.segments[i].show();
        }
        c.strokeStyle = `hsl(${this.rand * 60 + 180},100%,${this.rand * 60 + 25}%)`;
        c.lineWidth = this.rand * 2;
        c.lineCap = "round";
        c.lineJoin = "round";
        c.stroke();
        c.globalCompositeOperation = "source-over";
      }
    }
    show2(target) {
      c.beginPath();
      const radius = dist(this.x, this.y, target.x, target.y) <= this.l
        ? 2 * this.rand + 1
        : this.rand * 2;
      c.arc(this.x, this.y, radius, 0, 2 * Math.PI);
      c.fillStyle = dist(this.x, this.y, target.x, target.y) <= this.l ? "white" : "darkcyan";
      c.fill();
    }
  }

  function dist(p1x, p1y, p2x, p2y) {
    return Math.sqrt((p2x - p1x) ** 2 + (p2y - p1y) ** 2);
  }

  for (let i = 0; i < numt; i++) {
    tent.push(new Tentacle(
      Math.random() * w,
      Math.random() * h,
      Math.random() * (maxl - minl) + minl,
      n
    ));
  }

  function draw() {
    if (mouse.x !== false) {
      target.x += (mouse.x - target.x) / 10;
      target.y += (mouse.y - target.y) / 10;
    } else {
      const centerX = w / 2;
      const centerY = h / 2;
      const angle = Math.sqrt(2) * Math.cos(t) / (Math.pow(Math.sin(t), 2) + 1);
      target.x = centerX + (centerY - 10) * angle - target.x;
      target.y = centerY + ((centerY - 10) * Math.cos(t) * Math.sin(t)) / (Math.pow(Math.sin(t), 2) + 1) - target.y;
    }

    t += 0.01;

    c.clearRect(0, 0, w, h);

    // Draw background circle
    c.beginPath();
    c.arc(target.x, target.y, dist(last_target.x, last_target.y, target.x, target.y) + 5, 0, 2 * Math.PI);
    c.fillStyle = "hsl(210,100%,80%)";
    c.fill();

    // Update and draw tentacles
    tent.forEach(tentacle => {
      tentacle.move(last_target, target);
      tentacle.show2(target);
    });
    tent.forEach(tentacle => tentacle.show(target));

    last_target.x = target.x;
    last_target.y = target.y;
  }

  canvas.addEventListener("mousemove", function(e) {
    last_mouse.x = mouse.x;
    last_mouse.y = mouse.y;
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
  });

  canvas.addEventListener("mouseleave", function() {
    mouse.x = false;
    mouse.y = false;
  });

  canvas.addEventListener("mousedown", () => clicked = true);
  canvas.addEventListener("mouseup", () => clicked = false);

  function loop() {
    window.requestAnimFrame(loop);
    draw();
  }

  window.addEventListener("resize", function() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  loop();
};
