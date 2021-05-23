import {Button, Grid} from '@material-ui/core';
import {makeStyles} from "@material-ui/core";
import React from 'react'
const useStyles = makeStyles({
  btn: {
    marginTop: 10,
    marginBottom: 10
  },
});
function App() {
  const classes = useStyles();
  const [renderTime, setRenderTime] = React.useState(0);
  class Vector {
    constructor(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    static times (k, v) {
      return new Vector(k * v.x, k * v.y, k * v.z);
    }
    static minus (v1, v2) {
      return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }
    static plus (v1, v2) {
      return new Vector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }
    static dot (v1, v2) {
      return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
    static mag (v) {
      return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }
    static norm (v) {
      let mag = Vector.mag(v);
      let div = (mag === 0) ? Infinity : 1.0 / mag;
      return Vector.times(div, v);
    }
    static cross (v1, v2) {
      return new Vector(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
    }
  }

  class Color {
    constructor(r, g, b) {
      this.r = r;
      this.g = g;
      this.b = b;
    }
    static scale (k, v) {
      return new Color(k * v.r, k * v.g, k * v.b);
    }
    static plus (v1, v2) {
      return new Color(v1.r + v2.r, v1.g + v2.g, v1.b + v2.b);
    }
    static times (v1, v2) {
      return new Color(v1.r * v2.r, v1.g * v2.g, v1.b * v2.b);
    }
    static getWhite () {
      if (Color.white == null) {
        Color.white = new Color(1.0, 1.0, 1.0);
      }
      return Color.white;
    }

    static getGrey () {
      if (Color.grey == null) {
        Color.grey = new Color(0.5, 0.5, 0.5);
      }
      return Color.grey;
    }

    static getBlack () {
      if (Color.black == null) {
        Color.black = new Color(0.0, 0.0, 0.0);
      }
      return Color.black;
    }

    static getBackground () {
      if (Color.background == null) {
        Color.background = Color.getBlack();
      }
      return Color.background;
    }

    static getDefaultColor () {
      if (Color.defaultColor == null) {
        Color.defaultColor = Color.getBlack();
      }
      return Color.defaultColor;
    }

    static toDrawingColor (c) {
      let legalize = function (d) { return d > 1 ? 1 : d; };
      return new Color(
          Math.floor(legalize(c.r) * 255),
          Math.floor(legalize(c.g) * 255),
          Math.floor(legalize(c.b) * 255)
      );
    }
  }

  class Camera {
    constructor(pos, lookAt) {
      this.pos = pos;
      let down = new Vector(0.0, -1.0, 0.0);
      this.forward = Vector.norm(Vector.minus(lookAt, this.pos));
      this.right = Vector.times(1.5, Vector.norm(Vector.cross(this.forward, down)));
      this.up = Vector.times(1.5, Vector.norm(Vector.cross(this.forward, this.right)));
    }
  }

  class Ray {
    constructor(start, dir) {
      this.start = start;
      this.dir = dir;
    }
  }

  class Intersection {
    constructor(thing, ray, dist) {
      this.thing = thing;
      this.ray = ray;
      this.dist = dist;
    }
  }

  class Surface {
    constructor(diffuse, specular, reflect, roughness) {
      this.diffuse = diffuse || null;
      this.specular = specular || null;
      this.reflect = reflect || null;
      this.roughness = roughness || null;
    }
  }

  class Thing {
    constructor() {
      this.surface = null;
    }
  }

  class Light {
    constructor(pos, color) {
      this.pos = pos;
      this.color = color;
    }
  }

  class Scene {
    constructor(things, lights, camera) {
      this.things = things;
      this.lights = lights;
      this.camera = camera;
    }
  }

  let Surfaces = (function () {
    function Surfaces() {
    }
    Surfaces.getShiny = function () {
      if (Surfaces.shiny == null)
        Surfaces.shiny = new Surface(function (pos) {
          return Color.getWhite();
        }, function (pos) {
          return Color.getGrey();
        }, function (pos) {
          return 0.7;
        }, 250);
      return Surfaces.shiny;
    };

    Surfaces.getCheckerboard = function () {
      if (Surfaces.checkerboard == null)
        Surfaces.checkerboard = new Surface(function (pos) {
          if ((Math.floor(pos.z) + Math.floor(pos.x)) % 2 !== 0) {
            return Color.getWhite();
          }
          else {
            return Color.getBlack();
          }
        }, function (pos) {
          return Color.getWhite();
        }, function (pos) {
          if ((Math.floor(pos.z) + Math.floor(pos.x)) % 2 !== 0) {
            return 0.1;
          }
          else {
            return 0.7;
          }
        }, 150);
      return Surfaces.checkerboard;
    };
    return Surfaces;
  }());

  class Sphere extends Thing {
    constructor(center, radius, surface) {
      super();
      this.center = center;
      this.radius2 = radius * radius;
      this.surface = surface;
      return this;
    }
    normal (pos) {
      return Vector.norm(Vector.minus(pos, this.center));
    }
    intersect (ray) {
      let eo = Vector.minus(this.center, ray.start);
      let v = Vector.dot(eo, ray.dir);
      let dist = 0;
      if (v >= 0) {
        let disc = this.radius2 - (Vector.dot(eo, eo) - v * v);
        if (disc >= 0) {
          dist = v - Math.sqrt(disc);
        }
      }
      if (dist === 0) {
        return null;
      }
      else {
        return new Intersection(this, ray, dist);
      }
    }
  }

  class Plane extends Thing {
    constructor(norm, offset, surface) {
      super();
      this.norm = norm;
      this.offset = offset;
      this.surface = surface;
      return this;
    }
    intersect (ray) {
      let denom = Vector.dot(this.norm, ray.dir);
      if (denom > 0) {
        return null;
      }
      else {
        let dist = (Vector.dot(this.norm, ray.start) + this.offset) / (-denom);
        return new Intersection(this, ray, dist);
      }
    }

    normal (pos) {
      return this.norm;
    }
  }

  class RayTracer {
    constructor() {
       this.maxDepth = 5;
      this.imageRef = undefined;
      this.imgdata = undefined;
      this.imgwidth = undefined;
      this.synopsis = undefined;
    }
    intersections (ray, scene) {
      let closest = +Infinity;
      let closestInter = null;
      for (let i = 0, imax=scene.things.length; i < imax; i++) {
        let inter = scene.things[i].intersect(ray);
        if (inter != null && inter.dist < closest) {
          closestInter = inter;
          closest = inter.dist;
        }
      }
      return closestInter;
    }
    testRay (ray, scene) {
      let isect = this.intersections(ray, scene);
      if (isect != null) {
        return isect.dist;
      }
      else {
        return null;
      }
    }
    /*private*/ traceRay (ray, scene, depth) {
      let isect = this.intersections(ray, scene);
      if (isect == null) {
        return Color.getBackground();
      }
      else {
        return this.shade(isect, scene, depth);
      }
    }
    /*private*/ shade (isect, scene, depth) {
      let d = isect.ray.dir;
      let pos = Vector.plus(Vector.times(isect.dist, d), isect.ray.start);
      let normal = isect.thing.normal(pos);
      let reflectDir = Vector.minus(d, Vector.times(2, Vector.times(Vector.dot(normal, d), normal)));
      let naturalColor = Color.plus(Color.getBackground(), this.getNaturalColor(isect.thing, pos, normal, reflectDir, scene));
      let reflectedColor = (depth >= this.maxDepth) ? Color.getGrey() : this.getReflectionColor(isect.thing, pos, normal, reflectDir, scene, depth);
      return Color.plus(naturalColor, reflectedColor);
    }
    getReflectionColor (thing, pos, normal, rd, scene, depth) {
      return Color.scale(
          thing.surface.reflect(pos),
          this.traceRay(new Ray(pos, rd), scene, depth + 1)
      );
    }
     getNaturalColor (thing, pos, norm, rd, scene) {
      let _this = this;
      let addLight = function (col, light, fil1, fil2) {
        let ldis = Vector.minus(light.pos, pos);
        let livec = Vector.norm(ldis);
        let neatIsect = _this.testRay(new Ray(pos, livec), scene);
        let isInShadow = (neatIsect == null) ? false : (neatIsect <= Vector.mag(ldis));
        if (isInShadow) {
          return col;
        }
        else {
          let illum = Vector.dot(livec, norm);
          let lcolor = (illum > 0) ? Color.scale(illum, light.color) : Color.getDefaultColor();
          let specular = Vector.dot(livec, Vector.norm(rd));
          let scolor = (specular > 0) ? Color.scale(Math.pow(specular, thing.surface.roughness), light.color) : Color.getDefaultColor();
          return Color.plus(col,
              Color.plus(Color.times(thing.surface.diffuse(pos), lcolor),
                  Color.times(thing.surface.specular(pos), scolor))
          );
        }
      };
      return ((scene.lights).reduce((addLight), Color.getDefaultColor()));
    }

    clearImageData() {
      for ( let i = 0, l = this.imgdata.length; i < l; i += 4 ) {
        this.imgdata[ i ] = 0;
        this.imgdata[ i + 1 ] = 0;
        this.imgdata[ i + 2 ] = 0;
        this.imgdata[ i + 3 ] = 255;
      }
    }

    getImageData(ctx, w, h) {
      this.imageRef = ctx.getImageData( 0, 0, w, h );
      this.imgdata = this.imageRef.data;
      this.imgwidth = this.imageRef.width;
    }

    putImageData(ctx) {
      ctx.putImageData( this.imageRef, 0, 0 );
    }

    setPixel( x, y, r, g, b, a ) {
      let i = ( x + y * this.imgwidth ) * 4;
      this.imgdata[ i ] = r;
      this.imgdata[ i + 1 ] = g;
      this.imgdata[ i + 2 ] = b;
      this.imgdata[ i + 3 ] = a;
    }

    setRect(x1, y1, x2, y2, r, g, b, a) {
      for (let x = x1; x < x2; x++) {
        for (let y = y1; y < y2; y++) {
          this.setPixel(x, y, r, g, b, a);
        }
      }
    }

    setScenes(synopsis) {
      this.synopsis = synopsis;
    }

    snapshot(ctx, screenWidth, screenHeight) {
      this.getImageData(ctx, screenWidth, screenHeight);
      this.clearImageData();
    }

    getPoint (x, y, camera, screenWidth, screenHeight) {
      let recenterX = function (x2) {
        return ((x2 - (screenWidth / 2.0)) / 2.0 / screenWidth);
      };
      let recenterY = function (y2) {
        return -((y2 - (screenHeight / 2.0)) / 2.0 / screenHeight);
      };
      return Vector.norm(
          Vector.plus(camera.forward,
              Vector.plus(
                  Vector.times(recenterX(x), camera.right),
                  Vector.times(recenterY(y), camera.up)
              )
          )
      );
    }

    render (screenWidth, screenHeight, blokX1, blokY1, blokX2, blokY2) {
      let _loop_1 = function (y) {
        let _loop_2 = function (x) {
          let color = this_1.traceRay(
              new Ray(this_1.synopsis.camera.pos,
                  this_1.getPoint(x, y, this_1.synopsis.camera, screenWidth, screenHeight)
              ), this_1.synopsis, 0);
          let c = Color.toDrawingColor(color);
          this_1.setRect(x, y, x + 1, y + 1, c.r, c.g, c.b, 255);
        };
        for (let xp = blokX1; xp < blokX2; xp++) {
          _loop_2(xp);
        }
      };
      let this_1 = this;
      for (let yp = blokY1; yp < blokY2; yp++) {
        _loop_1(yp);
      }
      return {status:"OK", blokX1, blokY1, blokX2, blokY2};
    }
  }

  function defaultScene() {
    return new Scene(
        [
          new Plane(new Vector(0.0, 1.0, 0.0), 0.0, Surfaces.getCheckerboard()),
          new Sphere(new Vector(0.0, 1.0, -0.25), 1.0, Surfaces.getShiny()),
          new Sphere(new Vector(1.0, 0.0, 0.25), 1.0, Surfaces.getShiny()),
          new Sphere(new Vector(-1.0, 0.5, 1.5), 0.5, Surfaces.getShiny()),
          new Sphere(new Vector(0.5, 1.9, 2), 0.3, Surfaces.getShiny())
        ],
        [
            new Light(new Vector(-2.0, 2.5, 0.0), new Color(0.49, 0.07, 0.07)),
          new Light(new Vector(1.5, 2.5, 1.5), new Color(0.07, 0.07, 0.49)),
          new Light(new Vector(1.5, 2.5, -1.5), new Color(0.07, 0.49, 0.071)),
          new Light(new Vector(0.0, 3.5, 0.0), new Color(0.21, 0.21, 0.35))
        ],
        new Camera(new Vector(3.0, 2.0, 4.0), new Vector(-1.0, 0.5, 0.0)));
  }
  function main() {
    let start = performance.now();
    function promiseRender(xsize, ysize, x1, y1, x2, y2) {
      return new Promise((resolve) => {
        let response = rayTracer.render(xsize, ysize, x1, y1, x2, y2);
        resolve(response);
      });
    }

    let ratio = 4;
    let block = 256;
    let xsize = block*ratio;
    let ysize = xsize;
    let w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    let h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    let windowSize = Math.min(w, h);

    let canv = document.createElement("canvas");
    canv.width = xsize;
    canv.height = ysize;
    canv.style.transform = "scale(" + (windowSize / xsize) + "," + (windowSize / ysize) + ")";
    canv.style.transformOrigin = "0 0";
    console.log("transform=" + canv.style.transform);
    document.getElementById('canvas').appendChild(canv);
    let context = canv.getContext("2d");

    let rayTracer = new RayTracer();
    rayTracer.setScenes(defaultScene());
    rayTracer.snapshot(context, xsize, ysize);

    let jobs = [];
    for(let xi=0; xi<xsize; xi+= block) {
      for(let yi=0; yi<xsize; yi+= block) {
        jobs.push(promiseRender(xsize, ysize, xi, yi, xi+block, yi+block).then(data => console.log(data)));
      }
    }

    Promise.all(jobs).then(function(values) {
      console.log('all blocks rendered');
      rayTracer.putImageData(context);
    });
    setRenderTime(performance.now() - start);
  }
  const getSeconds = (time) => {
    let seconds = time / 1000;
    return seconds.toFixed(3);
  }
  return (
      <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
      >
        <Grid item xs = {4} className={classes.btn}>
          <Button variant="contained" color="primary" onClick={main}>Отрисовать Сцену</Button>
        </Grid>
        <Grid time xs = {2}>
          {renderTime !== 0 && <h3>{`рендер занял ${getSeconds(renderTime)} секунды`}</h3> }
        </Grid>
        <Grid item id = 'canvas'>
        </Grid>
      </Grid>
  )
}

export default App;
