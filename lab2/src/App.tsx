import React, {useEffect, useState} from 'react';
import {Button, Container, FormControl, Grid, makeStyles, Slider, TextField} from "@material-ui/core";
import {produce} from 'immer'

const useStyles = makeStyles((theme) => ({
    '@global': {
        h2: {
            textAlign: 'center'
        },
    },
    root: {
        '& > *': {
            margin: theme.spacing(1),
            width: '25ch',
        },
    },
    formControl: {
        display: 'flex',
        wrap: 'nowrap',
        margin: theme.spacing(1),
        fullWidth: true
    },
    canvas: {
        width: 800,
        height: 800,
        border: 1,
        background: '#DCDCDC',
        borderStyle: 'solid',
        borderColor: 'black',
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    slider: {
        width: 400
    },
}));

interface Point {
    id: number;
    x: any;
    y: any;
    z: any;

}

interface Point2 {
    x: any;
    y: any;
}


function App(this: any) {
    const xx = -1 * Math.cos(Math.PI / 6);
    const xy = Math.sin(Math.PI / 6);
    const yx = Math.sin(Math.PI / 3);
    const yy = Math.cos(Math.PI / 3);
    const zy = -1;
    const multiply = (p: Point, val: number): Point => {
        return {
            id: 0,
            x: p.x * val,
            y: p.y * val,
            z: p.z * val
        };
    }
    const add = (p1: Point, p2: Point): Point => {
        return {
            id: 0,
            x: p1.x + p2.x,
            y: p1.y + p2.y,
            z: p1.z + p2.z
        }
    }
    const to2D = (p: Point): Point2 => {
        let x = p.x;
        let y = p.y;
        let z = p.z;
        return {
            x: x * xx + y * yx,
            y: x * xy + y * yy + z * zy
        }
    }
    const [errorType, setErrorType] = useState<boolean[]>([false, false, false, false, false, false, false, false, false, false, false, false]);
    const [errorMessage, setErrorMessage] = useState<string[]>(['', '', '', '', '', '', '', '', '', '', '', '']);
    const [drawError, setDrawError] = useState<string>('');
    const [degX, setDegX] = useState<number>(0);
    const [degY, setDegY] = useState<number>(0);
    const [points, setPoints] = useState<Point[]>([
        {
            id: 0,
            x: '',
            y: '',
            z: ''
        }, {
        id: 1,
            x: '',
            y: '',
            z: ''
        }, {
            id: 2,
            x: '',
            y: '',
            z: ''
        }, {
            id: 3,
            x: '',
            y: '',
            z: ''
        }
    ])
    const [rotatePoints, setRotatePoints] = useState<Point[]>(points);
    const classes = useStyles();
    const isFieldsFilled = (): boolean => {
        for (let i = 0; i < errorType.length; i++) {
            if (errorType[i]) {
                return false
            }
        }
        return true
    }
    const drawAxes = () => {
        contextRef.current.lineWidth = 3;
        contextRef.current.strokeStyle = 'black'
        contextRef.current.beginPath();
        contextRef.current.moveTo(to2D({id: 0, x: 0, y: 0, z: 0}).x, to2D({id: 0, x: 0, y: 0, z: 0}).y);
        contextRef.current.lineTo(to2D({id: 0, x: 600, y: 0, z: 0}).x, to2D({id: 0, x: 600, y: 0, z: 0}).y);
        contextRef.current.closePath();
        contextRef.current.font = "20px bold";
        contextRef.current.fillStyle = 'black';
        contextRef.current.fillText("X", -400, 215);
        contextRef.current.stroke();
        contextRef.current.strokeStyle = 'green'
        contextRef.current.beginPath();
        contextRef.current.moveTo(to2D({id: 0, x: 0, y: 0, z: 0}).x, to2D({id: 0, x: 0, y: 0, z: 0}).y);
        contextRef.current.lineTo(to2D({id: 0, x: 0, y: 600, z: 0}).x, to2D({id: 0, x: 0, y: 600, z: 0}).y);
        contextRef.current.closePath();
        contextRef.current.fillStyle = 'green';
        contextRef.current.fillText("Y", 385, 210);
        contextRef.current.stroke();
        contextRef.current.strokeStyle = 'red'
        contextRef.current.beginPath();
        contextRef.current.moveTo(to2D({id: 0, x: 0, y: 0, z: 0}).x, to2D({id: 0, x: 0, y: 0, z: 0}).y);
        contextRef.current.lineTo(to2D({id: 0, x: 0, y: 0, z: 600}).x, to2D({id: 0, x: 0, y: 0, z: 600}).y);
        contextRef.current.closePath();
        contextRef.current.fillStyle = 'red';
        contextRef.current.fillText("Z", 10, -380);
        contextRef.current.stroke();
    }

    const canvasRef: any = React.useRef(null);
    const contextRef: any = React.useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.translate(canvas.width / 2, canvas.height / 2);
        contextRef.current = ctx;
        contextRef.current.lineWidth = 1;
        drawAxes();
    }, []);
    const clearCanvas = () => {
        contextRef.current.save();
        contextRef.current.setTransform(1, 0, 0, 1, 0, 0);
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        contextRef.current.restore();
    }
    const handleDrawSurface = (newValue: any) => {
        if (!isFieldsFilled()) {
            setDrawError('Не все поля корректно заполнены');
            return
        }
        setDrawError('');
        setRotatePoints(points);
        drawSurface(points);
    }
    const handleRotateX = (event: any, newValue: any) => {
        if (!isFieldsFilled()) {
            setDrawError('Не все поля корректно заполнены');
            return
        }
        setDrawError('');
        const oldValue = degX;
        setDegX(+newValue);
        rotateX(+newValue - oldValue);
    }
    const rotateX = (degree: number) => {
        const newDegree = (degree * Math.PI) / 180;
        let newPoints: Point[] = [];
        for (let i = 0; i < rotatePoints.length; i++) {
            newPoints.push(
                {
                    id: 0,
                    x: rotatePoints[i].x,
                    y: rotatePoints[i].y * Math.cos(newDegree) + rotatePoints[i].z * Math.sin(newDegree),
                    z: -rotatePoints[i].y * Math.sin(newDegree) + rotatePoints[i].z * Math.cos(newDegree)
                }
            )
        }
        setRotatePoints(newPoints);

        drawSurface(rotatePoints);

    }
    const handleRotateY = (event: any, newValue: any) => {
        if (!isFieldsFilled()) {
            setDrawError('Не все поля корректно заполнены');
            return
        }
        setDrawError('');
        const oldValue = degY;
        setDegY(+newValue);
        rotateY(+newValue - oldValue);
    }
    const rotateY = (degree: number) => {
        const newDegree = (degree * Math.PI) / 180;
        let newPoints: Point[] = [];
        for (let i = 0; i < rotatePoints.length; i++) {
            newPoints.push({
                id: 0,
                x: rotatePoints[i].x * Math.cos(newDegree) + rotatePoints[i].z * Math.sin(newDegree),
                y: rotatePoints[i].y,
                z: -rotatePoints[i].x * Math.sin(newDegree) + rotatePoints[i].z * Math.cos(newDegree)
            })
        }
        setRotatePoints(newPoints);

        drawSurface(rotatePoints);
    }
    const drawSurface = (newPoints: Point[]) => {
        clearCanvas();
        drawAxes();
        let horizontalLines = [];
        let verticalLines = [];
        contextRef.current.lineWidth = 2;
        contextRef.current.strokeStyle = 'red'
        contextRef.current.fillStyle = 'rgba(0,0,0,0.5)';

        contextRef.current.beginPath();
        const startPoint = to2D(newPoints[0]);
        contextRef.current.moveTo(startPoint.x, startPoint.y);
        for (let i = 1; i < 4; i++) {
            let currPnt = to2D(newPoints[i]);
            contextRef.current.lineTo(currPnt.x, currPnt.y);
        }
        contextRef.current.closePath();
        contextRef.current.stroke();
        let w, u;
        for (let u = 0.05; u < 1; u += 0.05) {
            w = 0;

            verticalLines.push(to2D(add(add(multiply(newPoints[0], (1 - u) * (1 - w)), multiply(newPoints[1], (1 - u) * w)),
                add(multiply(newPoints[3], u * (1 - w)), multiply(newPoints[2], u * w)))));
            w = 1;

            verticalLines.push(to2D(add(add(multiply(newPoints[0], (1 - u) * (1 - w)), multiply(newPoints[1], (1 - u) * w)),
                add(multiply(newPoints[3], u * (1 - w)), multiply(newPoints[2], u * w)))));
        }
        for (let w = 0.05; w < 1; w += 0.05) {
            u = 0;
            horizontalLines.push(to2D(add(add(multiply(newPoints[0], (1 - u) * (1 - w)), multiply(newPoints[1], (1 - u) * w)), add(multiply(newPoints[3], u * (1 - w)), multiply(newPoints[2], u * w)))));
            u = 1;
            horizontalLines.push(to2D(add(add(multiply(newPoints[0], (1 - u) * (1 - w)), multiply(newPoints[1], (1 - u) * w)), add(multiply(newPoints[3], u * (1 - w)), multiply(newPoints[2], u * w)))));
        }
        for (let i = 0; i < horizontalLines.length; i = i + 2) {
            contextRef.current.beginPath();
            contextRef.current.moveTo(horizontalLines[i].x, horizontalLines[i].y);
            contextRef.current.lineTo(horizontalLines[i + 1].x, horizontalLines[i + 1].y);
            contextRef.current.stroke();
            contextRef.current.closePath();
            contextRef.current.beginPath();
            contextRef.current.moveTo(verticalLines[i].x, verticalLines[i].y);
            contextRef.current.lineTo(verticalLines[i + 1].x, verticalLines[i + 1].y);
            contextRef.current.stroke();
            contextRef.current.closePath();
        }

    }


    return (
        <Grid container justify='center'>

            <Grid item container lg={6} xs={12}>
                <canvas
                    className={classes.canvas}
                    ref={canvasRef}
                    width={800}
                    height={800}
                />
            </Grid>
            <Grid item lg={3} xs={5}>
                <h2>Координаты точек</h2>
                {(drawError) && <div style={{color: 'red'}}><h3>{drawError}</h3></div>}
                <form noValidate autoComplete="off">

                    {points.map((p, index) => {
                        return (
                            <Grid item container direction={'row'} spacing={4} key={p.id}>
                                <Grid item xs={4}>

                                    <TextField label={'x' + (p.id + 1)} variant="outlined" size={'small'} onChange={
                                        event => {
                                            if (event.target.value == "") {
                                                setErrorType(prev => {
                                                    const newValues = [...prev];
                                                    newValues[index * 3] = true;
                                                    return newValues;
                                                });
                                                setErrorMessage(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index * 3] = 'Пустое поле';
                                                    })

                                                });
                                            } else if (isNaN(+event.target.value)) {
                                                setErrorType(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index * 3] = true;
                                                    })

                                                })
                                                setErrorMessage(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index * 3] = 'Не число';
                                                    })

                                                });
                                            } else {
                                                setErrorType(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index * 3] = false;
                                                    })

                                                })
                                                setErrorMessage(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index * 3] = '';
                                                    })

                                                });
                                                const newX = event.target.value;

                                                setPoints(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index].x = +newX;
                                                    })
                                                })
                                            }
                                        }
                                    }
                                               error={errorType[index * 3]}
                                               helperText={errorMessage[index * 3]}
                                               defaultValue={p.x}
                                    />

                                </Grid>
                                <Grid item xs={4}>
                                    <TextField label={'y' + (p.id + 1)} variant="outlined" size={'small'} onChange={
                                        event => {
                                            if (event.target.value == "") {
                                                setErrorType(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index * 3 + 1] = true;
                                                    })

                                                })
                                                setErrorMessage(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index * 3 + 1] = 'Пустое поле';
                                                    })

                                                });
                                            } else if (isNaN(+event.target.value)) {
                                                setErrorType(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index * 3 + 1] = true;
                                                    })

                                                })
                                                setErrorMessage(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index * 3 + 1] = 'Не число';
                                                    })

                                                });
                                            } else {
                                                setErrorType(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index * 3 + 1] = false;
                                                    })

                                                })
                                                setErrorMessage(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index * 3 + 1] = '';
                                                    })

                                                });
                                                const newY = event.target.value;
                                                setPoints(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index].y = +newY;
                                                    })
                                                })
                                            }
                                        }
                                    }
                                               error={errorType[index * 3 + 1]}
                                               helperText={errorMessage[index * 3 + 1]}
                                               defaultValue={p.y}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField label={'z' + (p.id + 1)} variant="outlined" size={'small'} onChange={
                                        event => {
                                            if (event.target.value == "") {
                                                setErrorType(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index * 3 + 2] = true;
                                                    })

                                                })
                                                setErrorMessage(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index * 3 + 2] = 'Пустое поле';
                                                    })

                                                });
                                            } else if (isNaN(+event.target.value)) {
                                                setErrorType(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index * 3 + 2] = true;
                                                    })

                                                })
                                                setErrorMessage(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index * 3 + 2] = 'Не число';
                                                    })

                                                });
                                            } else {
                                                setErrorType(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index * 3 + 2] = false;
                                                    })

                                                })
                                                setErrorMessage(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index * 3 + 2] = '';
                                                    })

                                                });
                                                const newZ = event.target.value;
                                                setPoints(currPoints => {
                                                    return produce(currPoints, v => {
                                                        v[index].z = +newZ;
                                                    })
                                                })
                                            }
                                        }
                                    }
                                               error={errorType[index * 3 + 2]}
                                               helperText={errorMessage[index * 3 + 2]}
                                               defaultValue={p.y}
                                    />
                                </Grid>
                            </Grid>
                        )
                    })}
                    <Grid>
                        <FormControl className={classes.formControl}>
                            <Button variant="contained" color="primary" onClick={handleDrawSurface}>
                                Нарисовать поверхность
                            </Button>
                            <h2>
                                Поворот относительно X
                            </h2>
                            <Grid item xs={12}>
                                <Slider
                                    defaultValue={0}
                                    aria-labelledby="discrete-slider-always"
                                    step={1}
                                    max={360}
                                    min={0}
                                    value={degX}
                                    valueLabelDisplay="on"
                                    onChange={handleRotateX}
                                />
                            </Grid>
                            <h2>
                                Поворот относительно Y
                            </h2>
                            <Grid item xs={12}>
                                <Slider
                                    defaultValue={0}
                                    aria-labelledby="discrete-slider-always"
                                    step={1}
                                    max={360}
                                    min={0}
                                    value={degY}
                                    valueLabelDisplay="on"
                                    onChange={handleRotateY}
                                />
                            </Grid>
                        </FormControl>
                    </Grid>
                </form>
            </Grid>
        </Grid>
    );
}

export default App;
