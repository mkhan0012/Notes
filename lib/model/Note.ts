import mongoose, { Schema, models } from "mongoose";

const noteSchema = new Schema(
  {
    title: { type: String, default: "Untitled Note" }, // New Field
    content: { type: String, default: "" },
  },
  { timestamps: true }
);

const Note = models.Note || mongoose.model("Note", noteSchema);

export default Note;