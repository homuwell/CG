
import React from 'react';
import {Grid, makeStyles} from '@material-ui/core'
import DataForm from './DataForm'
import {useSelector, useDispatch} from "react-redux";
import {
    setX,
    setY,
    setDegree,
    selectPoints
} from '../features/pointsSlice'
const useStyles = makeStyles( (theme) => ({
    '@global': {
        h2: {
            textAlign: 'center'
        },
    },
    back: {
        position: 'absolute',
        zIndex: 0,
    },
    front: {
        position: 'absolute',
        zIndex: 1,
    },
    canvasContainer: {
        width: 800,
        height: 800,
        position: 'relative',
        border: '1px solid',
    },
    gridCanvas: {
        minWidth: 800,
        minHeight: 800,
        marginTop: 20,
    }
} ))

const CanvasElement = (props :any, ref:any ) => {
    const PointNumber = 7;
    const points = useSelector(selectPoints);
    const dispatch = useDispatch();
    const classes = useStyles();
    const backRef :any = React.useRef();
    const frontRef :any = React.useRef();
    const backCtx :any = React.useRef();
    const frontCtx :any = React.useRef();
    const clearCanvas = () => {
        frontCtx.current.save();
        frontCtx.current.setTransform(1, 0, 0, 1, 0, 0);
        frontCtx.current.clearRect(0, 0, frontRef.current.width, frontRef.current.height);
        frontCtx.current.restore();
    }



    const drawAxes = () => {
        backCtx.current.lineWidth = 2;
        backCtx.current.strokeStyle = 'red';
        backCtx.current.beginPath();
        backCtx.current.moveTo(-400,0);
        backCtx.current.lineTo(400,0);
        backCtx.current.closePath();
        backCtx.current.stroke();
        backCtx.current.strokeStyle = 'green';
        backCtx.current.beginPath();
        backCtx.current.moveTo(0,-400);
        backCtx.current.lineTo(0,400);
        backCtx.current.closePath();
        backCtx.current.stroke();
    }
    const drawSpline = () => {
        clearCanvas();
        drawControlPoints();
        frontCtx.current.strokeStyle = 'black';
        frontCtx.current.fillStyle = 'black';
        let PointsNum = points.value.length;
        let degree = points.degree;
        let knots = [];
        for(let i = 0; i < PointsNum + degree + 1; i++) {
            knots[i] = i;
        }
        let currPtr;
        frontCtx.current.beginPath();
        for(let u = 0; u < 1; u+=0.001) {
            currPtr = calcCurrentPoint(u,degree,knots);
            if (u === 0) {
                frontCtx.current.moveTo(currPtr.x,-currPtr.y);
            }
            else frontCtx.current.lineTo(currPtr.x,-currPtr.y);
        }
        frontCtx.current.stroke();
    }

    const drawControlPoints = () => {
        frontCtx.current.strokeStyle = 'rgba(3,192,60,0.8)';
        frontCtx.current.fillStyle = 'rgba(3,192,60,0.8)';
        frontCtx.current.beginPath();
        frontCtx.current.moveTo(points.value[0].x,-points.value[0].y);
        for(let i = 1; i< points.value.length;i++) {
            frontCtx.current.lineTo(points.value[i].x,-points.value[i].y);
        }
        frontCtx.current.stroke();
        frontCtx.current.closePath();

        for(let i = 0; i < points.value.length; i++) {

            frontCtx.current.beginPath();
            frontCtx.current.arc(points.value[i].x,-points.value[i].y,4,0,360);
            frontCtx.current.fill();
            frontCtx.current.fillStyle = 'purple';
            frontCtx.current.fillText(`P${i+1}`, points.value[i].x -6,-points.value[i].y - 10);
            frontCtx.current.closePath();
            frontCtx.current.fillStyle = 'rgba(3,192,60,0.8)';
        }


    }



    const calcCurrentPoint = (u : number, degree : number, knots :number[]) :any => {
        let vals:any = [];
        for (let i = 0; i < points.value.length; i++) {
            vals.push({
                x:points.value[i].x,
                y:points.value[i].y
            });
        }
        let start = degree;
        let end = knots.length - 1 - degree;
        u = u * (end - start) + start;

        let s;
        for(s = start; s<end;s++) {
            if (u >= knots[s] && u <= knots[s+1]) {
                break;
            }
        }
        let alpha;
        for(let l = 1; l<= degree + 1;l++) {
            for (let i = s; i> s - degree -1 + l; i--) {
                alpha = (u-knots[i]) / (knots[i+degree+1-l] - knots[i]);
                vals[i].x = (1 - alpha) * vals[i-1].x + alpha * vals[i].x;
                vals[i].y = (1 - alpha) * vals[i-1].y + alpha * vals[i].y;
            }
        }
        return {
            x: vals[s].x,
            y: vals[s].y
        }

    }

    React.useEffect ( () => {
        const back = backRef.current;
        backCtx.current = back.getContext('2d');
        backCtx.current.translate(back.width / 2, back.height /2);
        const front = frontRef.current;
        frontCtx.current = front.getContext('2d');
        frontCtx.current.translate(front.width / 2, front.height / 2);
        drawAxes();
        }, []);

    return (
        <Grid container spacing={2}>
            <Grid xl={6} lg={12}  className={classes.gridCanvas} container justify='center' >
                <div className={classes.canvasContainer}>
                    <canvas ref={backRef} width={800} height={800} className={classes.back}>

                    </canvas>
                    <canvas ref={frontRef} width={800} height={800} className={classes.front}>
                    </canvas>
                </div>
            </Grid>

            <Grid container justify='center' xl={4} lg={12} className={classes.gridCanvas}>
                <DataForm func={drawSpline}/>
            </Grid>
        </Grid>

    );
}

export default CanvasElement;