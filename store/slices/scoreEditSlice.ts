import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ScoreEditItem {
  studentCode: string;
  theoryScore: number | null;
  practiceScore: number | null;
  midtermScore: number | null;
  finalScore: number | null;
}

interface ScoreEditState {
  editingStudentCode: string | null;
  edits: ScoreEditItem[];
}

const initialState: ScoreEditState = {
  editingStudentCode: null,
  edits: [],
};

const scoreEditSlice = createSlice({
  name: "scoreEdit",
  initialState,
  reducers: {
    startEdit(state, action: PayloadAction<string>) {
      state.editingStudentCode = action.payload;
    },
    cancelEdit(state) {
      state.editingStudentCode = null;
    },
    updateScoreField(
      state,
      action: PayloadAction<{
        studentCode: string;
        field: keyof Omit<ScoreEditItem, "studentCode">;
        value: number | null;
        current: Omit<ScoreEditItem, "studentCode">;
      }>
    ) {
      const { studentCode, field, value, current } = action.payload;
      let item = state.edits.find((e) => e.studentCode === studentCode);

      if (!item) {
        item = {
          studentCode,
          ...current,
        };
        state.edits.push(item);
      }
      item[field] = value;
    },
    saveEdit(state) {
      state.editingStudentCode = null;
    },
    clearAllEdits(state) {
      state.editingStudentCode = null;
      state.edits = [];
    },
  },
});

export const {
  startEdit,
  cancelEdit,
  updateScoreField,
  saveEdit,
  clearAllEdits,
} = scoreEditSlice.actions;

export default scoreEditSlice.reducer;
