import { createSlice } from '@reduxjs/toolkit'

const slice = createSlice({
  name: 'phrasebook',
  initialState: { phrases: [] },
  reducers: {
    addPhrase: (s, a) => { s.phrases.push(a.payload) }
  }
})

export const { addPhrase } = slice.actions
export default slice.reducer