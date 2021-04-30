import {createSlice} from '@reduxjs/toolkit'

export const pointsSlice = createSlice({
    name: 'points',
    initialState:  {
        value: [
            {id: 0, x: '', y: ''},
            {id: 1, x: '', y: ''},
            {id: 2, x: '', y: ''},
            {id: 3, x: '', y: ''},
            {id: 4, x: '', y: ''},
            {id: 5, x: '', y: ''},
            {id: 6, x: '', y: ''},
        ],
        degree: 1,

            },
    reducers: {
        setX: (state, action) => {

            state.value[action.payload.id].x = action.payload.value;
        },
        setY: (state, action) => {
            state.value[action.payload.id].y = action.payload.value;
        },
        setDegree: (state, action) => {
            state.degree = action.payload.value;
        }
    }
})

export const {setX, setY, setDegree} = pointsSlice.actions


export default pointsSlice.reducer

export const selectPoints = (store: { points: any; }) => store.points