import React from 'react';
import {useSelector, useDispatch} from "react-redux";
import {Grid, TextField, Slider, Button, makeStyles} from '@material-ui/core'
import {produce} from 'immer'
import {
    setX,
    setY,
    setDegree,
    selectPoints
} from '../features/pointsSlice'
const useStyles = makeStyles( (theme) => ({
    align: {
        margin:'0 auto',
    },
    centered: {
        margin: '0 auto'
    }
}))
interface InputProps {
    error :boolean;
    helper :string;
}

 function DataForm   (props :any) {
    const [inputState, setInputState] = React.useState<InputProps[]> (Array(14).fill({error: false, helper: ''}));
    const [errorMessage, setErrorMessage] = React.useState('');
    console.log(inputState);
     const  hasDuplicates = (array :any) => {
         let curr;
         for(let i = 0; i < array.length; i++) {
             curr = array[i];
             for(let j = i+1; j < array.length; j++) {
                 if(curr.x == array[j].x && curr.y == array[j].y) {
                     return true;
                 }
             }
         }
         return false;
     }
     const hasEmpty = (array: any) => {
         console.log(array);
         for(let i = 0; i < points.value.length; i++) {
             if (points.value[i].x === '' || points.value[i].y === '') {
                 return true;
             }
         }
         return false;
     }
     const classes = useStyles();
    const points = useSelector(selectPoints);
    const dispatch = useDispatch();
     const handleDraw = () => {
         if(hasEmpty(points.value)) {
             setErrorMessage('Не все поля заполнены');
             return
         }
         if(hasDuplicates(points.value)) {
             setErrorMessage('Одинаковые контрольные точки запрещены');
             return;
         }
         setErrorMessage('');
         props.func();


             }
    return (
        <form>
            <h2>
                Контрольные точки
            </h2>
            {{errorMessage} && <div style={{color: 'red'}}><h2>{errorMessage}</h2></div>}
            {points.value.map((p :any, m: number) => {
                return (
                    <Grid item container direction={'row'} spacing={1} key={p.id}>
                        <Grid item xs={6}>
                            <TextField label={'x' + (p.id + 1)} variant='outlined'  type='number'
                                       onChange={event => {
                                           if(event.target.value === '') {
                                               setInputState( prev => {
                                                   return produce(prev, v => {
                                                       v[m *2].error = true;
                                                       v[m *2].helper = 'Заполните поле';
                                                   });
                                               })
                                               dispatch(setX({id: p.id, value: ''}));
                                           } else {
                                               setInputState( prev => {
                                                   return produce(prev, v => {
                                                       v[m * 2].error = false;
                                                       v[m * 2].helper = '';
                                                   })
                                               });
                                               dispatch(setX({id: p.id, value: Number(event.target.value)}));
                                           }
                                       }}
                                       error={inputState[m * 2].error}
                                       helperText={inputState[m * 2].helper}
                                       value={p.x}
                                       defaultValue={''}
                            >

                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label={'y' + (p.id + 1)} variant='outlined'  type='number'
                                       onChange={event => {
                                           if(event.target.value === '') {
                                               setInputState( prev => {
                                                   return produce(prev, v => {
                                                       v[m *2 + 1].error = true;
                                                       v[m *2 + 1].helper = 'Заполните поле';
                                                   });
                                               })
                                               dispatch(setY({id: p.id, value: ''}));
                                           } else {
                                               setInputState( prev => {
                                                   return produce(prev, v => {
                                                       v[m * 2 + 1].error = false;
                                                       v[m * 2 + 1].helper = '';
                                                   })
                                               });
                                               dispatch(setY({id: p.id, value: Number(event.target.value)}));
                                           }
                                       }}
                                       error={inputState[m* 2 + 1].error}
                                       helperText={inputState[m * 2 +1].helper}
                                       value={p.y}
                            >

                            </TextField>
                        </Grid>

                    </Grid>
                )

            })}
            <h2>
                Степень сплайна
            </h2>
            <Grid container xs={6} className={classes.align}>
                <Slider
                    value={points.degree}
                    aria-labelledby="discrete-slider-always"
                    step={1}
                    max={6}
                    min={1}
                    valueLabelDisplay="on"

                    onChange={ (event, newValue)  => {
                        handleDraw();
                        if (errorMessage === '') {
                            dispatch(setDegree({value: newValue}));
                        }
                    }}
                />
                <div className={classes.centered}>
                    <Button variant="outlined" color="primary" onClick={handleDraw}>Нарисовать кривую</Button>
                </div>
            </Grid>
        </form>
    );
}


export default DataForm;
