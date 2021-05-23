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
    x: number;
    y: number;
    z: number
    constructor(x :number, y :number, z : number) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    static times (k :number, v :Vector) {
      return new Vector(k * v.x, k * v.y, k * v.z);
    }
    static minus (v1 :Vector, v2 :Vector) {
      return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }
    static plus (v1 :Vector, v2 :Vector) {
      return new Vector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }
    static dot (v1 :Vector, v2 :Vector) {
      return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
    static mag (v :Vector) {
      return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }
    static norm (v :Vector) {
      let mag = Vector.mag(v);
      let div = (mag === 0) ? Infinity : 1.0 / mag;
      return Vector.times(div,v);
    }
    static cross (v1 :Vector, v2 :Vector) {
      return new Vector(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
    }
  }

  class Color {
    r :number;
    g :number;
    b :number;
    white: any;
    private static white: Color;
    private static grey: Color;
    private static black: Color;
    private static background: Color;
    private static defaultColor: Color;
    constructor(r :number, g :number, b :number) {
      this.r = r;
      this.g = g;
      this.b = b;
    }
    static scale (k :number, v :Color) {
      return new Color(k * v.r, k * v.g, k * v.b);
    }
    static plus (v1 :Color, v2 :Color) {
      return new Color(v1.r + v2.r, v1.g + v2.g, v1.b + v2.b);
    }
    static times (v1 :Color, v2 :Color) {
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

    static toDrawingColor (c :Color) {
      let legalize = function (d :number) { return d > 1 ? 1 : d; };
      return new Color(
          Math.floor(legalize(c.r) * 255),
          Math.floor(legalize(c.g) * 255),
          Math.floor(legalize(c.b) * 255)
      );
    }
  }

  class Camera {
    forward :Vector;
    right :Vector;
    up :Vector;
    pos :Vector;
    constructor(pos :Vector, lookAt :Vector) {
      this.pos = pos;
      let down = new Vector(0.0, -1.0, 0.0);
      this.forward = Vector.norm(Vector.minus(lookAt, this.pos));
      this.right = Vector.times(1.5, Vector.norm(Vector.cross(this.forward, down)));
      this.up = Vector.times(1.5, Vector.norm(Vector.cross(this.forward, this.right)));
    }
  }

  class Ray {
    start :any;
    dir :any;
    constructor(start :any, dir :any) {
      this.start = start;
      this.dir = dir;
    }
  }

  class Intersection {
    thing :Thing;
    ray :Ray;
    dist :any;
    constructor(thing :Thing, ray: Ray, dist :any) {
      this.thing = thing;
      this.ray = ray;
      this.dist = dist;
    }
  }

  class Surface {
    diffuse :any;
    specular :any;
    reflect :any;
    roughness:any;
    constructor(diffuse :any, specular :any, reflect :any, roughness: number) {
      this.diffuse = diffuse || null;
      this.specular = specular || null;
      this.reflect = reflect || null;
      this.roughness = roughness || null;
    }
  }

class Thing {
    surface :Surface;
    constructor() {
      // @ts-ignore
      this.surface = null;
    }
  }

  class Light {
    pos :Vector;
    color :Color;
    constructor(pos :Vector, color :Color) {
      this.pos = pos;
      this.color = color;
    }
  }

  class Scene {
    things :Thing[];
    lights :Light[];
    camera :Camera;
    constructor(things :Thing[], lights :Light[], camera :Camera) {
      this.things = things;
      this.lights = lights;
      this.camera = camera;
    }
  }
  class Surfaces {
    private static shiny: Surface;
    private static checkerboard: Surface;
    static getShiny() {
      if (Surfaces.shiny == null)
        Surfaces.shiny = new Surface(function (pos :Vector) {
          return Color.getWhite();
        }, function (pos :Vector) {
          return Color.getGrey();
        }, function (pos :Vector) {
          return 0.7;
        }, 250);
      return Surfaces.shiny;
    }
    static getCheckerboard() {
      if (Surfaces.checkerboard == null)
        Surfaces.checkerboard = new Surface(function (pos :Vector) {
          if ((Math.floor(pos.z) + Math.floor(pos.x)) % 2 !== 0) {
            return Color.getWhite();
          }
          else {
            return Color.getBlack();
          }
        }, function (pos :Vector) {
          return Color.getWhite();
        }, function (pos :Vector) {
          if ((Math.floor(pos.z) + Math.floor(pos.x)) % 2 !== 0) {
            return 0.1;
          }
          else {
            return 0.7;
          }
        }, 150);
      return Surfaces.checkerboard;
    }
  }

  class Sphere extends Thing {
    center :Vector;
    radius :number;
    surface :Surface;
    constructor(center :Vector, radius :number, surface :Surface) {
      super();
      this.center = center;
      this.radius = radius * radius;
      this.surface = surface;
      return this;
    }
    normal (pos :Vector) {
      return Vector.norm(Vector.minus(pos, this.center));
    }
    intersect (ray :Ray) :Intersection {
      let eo = Vector.minus(this.center, ray.start);
      let v = Vector.dot(eo, ray.dir);
      let dist = 0;
      if (v >= 0) {
        let disc = this.radius - (Vector.dot(eo, eo) - v * v);
        if (disc >= 0) {
          dist = v - Math.sqrt(disc);
        }
      }
      if (dist === 0) {
        // @ts-ignore
        return null;
      }
      else {
        return new Intersection(this, ray, dist);
      }
    }
  }

  class Plane extends Thing {
    norm :Vector;
    offset :number;
    surface :Surface;
    constructor(norm :Vector, offset :number, surface :Surface) {
      super();
      this.norm = norm;
      this.offset = offset;
      this.surface = surface;
      return this;
    }
    intersect (ray :Ray) : Intersection{
      let denom = Vector.dot(this.norm, ray.dir);
      if (denom > 0) {
        // @ts-ignore
        return null;
      }
      else {
        let dist = (Vector.dot(this.norm, ray.start) + this.offset) / (-denom);
        return new Intersection(this, ray, dist);
      }
    }

    normal (pos :Vector) {
      return this.norm;
    }
  }

  class RayTracer {
    imgData :number[];
    maxDepth :number;
    imageRef :any;
    imgWidth :number;
    synopsis :Scene;
    constructor() {
      this.maxDepth = 5;
      // @ts-ignore
      this.imageRef = undefined;
      // @ts-ignore
      this.imgData = undefined;
      // @ts-ignore
      this.imgWidth = undefined;
      // @ts-ignore
      this.synopsis = undefined;
    }
    intersections (ray :Ray, scene :Scene) {
      let closest = +Infinity;
      let closestInter = null;
      for (let i = 0, imax=scene.things.length; i < imax; i++) {
        // @ts-ignore
        let inter = scene.things[i].intersect(ray);
        if (inter != null && inter.dist < closest) {
          closestInter = inter;
          closest = inter.dist;
        }
      }
      return closestInter;
    }
    testRay (ray :Ray, scene :Scene) {
      let isect = this.intersections(ray, scene);
      if (isect != null) {
        return isect.dist;
      }
      else {
        return null;
      }
    }
    traceRay (ray :Ray, scene :Scene, depth :number) :Color {
      let isect = this.intersections(ray, scene);
      if (isect == null) {
        return Color.getBackground();
      }
      else {
        return this.shade(isect, scene, depth);
      }
    }
    shade (isect :Intersection, scene :Scene, depth :number) {
      let d = isect.ray.dir;
      let pos = Vector.plus(Vector.times(isect.dist, d), isect.ray.start);
      // @ts-ignore
      let normal = isect.thing.normal(pos);
      let reflectDir = Vector.minus(d, Vector.times(2, Vector.times(Vector.dot(normal, d), normal)));
      let naturalColor = Color.plus(Color.getBackground(), this.getNaturalColor(isect.thing, pos, normal, reflectDir, scene));
      let reflectedColor = (depth >= this.maxDepth) ? Color.getGrey() : this.getReflectionColor(isect.thing, pos, normal, reflectDir, scene, depth);
      return Color.plus(naturalColor, reflectedColor);
    }
    getReflectionColor(thing: Thing, pos: Vector, normal: Vector, rd: Vector, scene: Scene, depth: number) {
      return Color.scale(
          thing.surface.reflect(pos),
          this.traceRay(new Ray(pos, rd), scene, depth + 1)
      );
    }
    getNaturalColor(thing: Thing, pos: Vector, normal: Vector, rd: Vector, scene: Scene) {
      let _this = this;
      let addLight = function (col :any, light :Light) {
        let ldis = Vector.minus(light.pos, pos);
        let livec = Vector.norm(ldis);
        let neatIsect = _this.testRay(new Ray(pos, livec), scene);
        let isInShadow = (neatIsect == null) ? false : (neatIsect <= Vector.mag(ldis));
        if (isInShadow) {
          return col;
        }
        else {
          let illum = Vector.dot(livec, normal);
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

      for ( let i = 0, l = this.imgData
          .length; i < l; i += 4 ) {
        this.imgData[ i ] = 0;
        this.imgData[ i + 1 ] = 0;
        this.imgData[ i + 2 ] = 0;
        this.imgData[ i + 3 ] = 255;
      }
    }

    getImageData(ctx :CanvasRenderingContext2D, w: number, h :number) {
      this.imageRef = ctx.getImageData( 0, 0, w, h );
      this.imgData
          = this.imageRef.data;
      this.imgWidth = this.imageRef.width;
    }

    putImageData(ctx :CanvasRenderingContext2D) {
      ctx.putImageData( this.imageRef, 0, 0 );
    }

    setPixel( x :number, y :number, r :number, g :number, b :number, a :number) {
      let i = ( x + y * this.imgWidth ) * 4;
      this.imgData
          [ i ] = r;
      this.imgData[ i + 1 ] = g;
      this.imgData[ i + 2 ] = b;
      this.imgData[ i + 3 ] = a;
    }

    setRect(x1 :number, y1 :number, x2 :number, y2 :number, r :number, g :number, b :number, a :number) {
      for (let x = x1; x < x2; x++) {
        for (let y = y1; y < y2; y++) {
          this.setPixel(x, y, r, g, b, a);
        }
      }
    }

    setScenes(synopsis :Scene) {
      this.synopsis = synopsis;
    }

    snapshot(ctx : CanvasRenderingContext2D, screenWidth :number, screenHeight :number) {
      this.getImageData(ctx, screenWidth, screenHeight);
      this.clearImageData();
    }

    getPoint (x :number, y :number, camera :Camera, screenWidth :number, screenHeight :number) {
      let recenterX = function (x2 :number) {
        return ((x2 - (screenWidth / 2.0)) / 2.0 / screenWidth);
      };
      let recenterY = function (y2 :number) {
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

    render (screenWidth :number, screenHeight :number, blockX1 :number, blockY1 :number, blockX2 :number, blockY2 :number) {
      let _loop_1 = function (y :number) {
        let _loop_2 = function (x :number) {
          let color = this_1.traceRay(
              new Ray(this_1.synopsis.camera.pos,
                  this_1.getPoint(x, y, this_1.synopsis.camera, screenWidth, screenHeight)
              ), this_1.synopsis, 0);
          let c = Color.toDrawingColor(color);
          this_1.setRect(x, y, x + 1, y + 1, c.r, c.g, c.b, 255);
        };
        for (let xp = blockX1; xp < blockX2; xp++) {
          _loop_2(xp);
        }
      };
      let this_1 = this;
      for (let yp = blockY1; yp < blockY2; yp++) {
        _loop_1(yp);
      }
      return {status:"OK", blockX1, blockY1, blockX2, blockY2};
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
    function promiseRender(xsize :number, ysize :number, x1 :number, y1 :number, x2 :number, y2 :number) {
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
    // @ts-ignore
    document.getElementById('canvas').appendChild(canv);
    let context = canv.getContext("2d");

    let rayTracer = new RayTracer();
    rayTracer.setScenes(defaultScene());
    // @ts-ignore
    rayTracer.snapshot(context, xsize, ysize);

    let jobs = [];
    for(let xi=0; xi<xsize; xi+= block) {
      for(let yi=0; yi<xsize; yi+= block) {
        jobs.push(promiseRender(xsize, ysize, xi, yi, xi+block, yi+block).then(data => console.log(data)));
      }
    }

    Promise.all(jobs).then(function(values) {
      console.log('all blocks rendered');
      // @ts-ignore
      rayTracer.putImageData(context);
    });
    setRenderTime(performance.now() - start);
  }
  const getSeconds = (time :number) => {
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
        <Grid item xs = {2}>
          {renderTime !== 0 && <h3>{`рендер занял ${getSeconds(renderTime)} секунды`}</h3> }
        </Grid>
        <Grid item id = 'canvas'>
        </Grid>
      </Grid>
  )
}
export default App;