import {configureStore} from '@reduxjs/toolkit';
import pointsSlice from "../features/pointsSlice";
export default configureStore ({
    reducer: {
        points: pointsSlice
    },
})