import { Note } from "@mypub/types";
import mongoose from "mongoose";

const { Schema } = mongoose;

const NoteSchema = new Schema<Note>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  application: {
    type: {
      name: { type: String, required: true },
      website: { type: String, required: true },
    },
    default: undefined,
  },
  content: { type: String, required: true },
  language: { type: String, required: true },
  visibility: { type: String, enum: ["public", "unlisted", "private"] },
  sensitive: { type: Boolean, required: true },
  sensitiveSummary: String,
  pinned: { type: Boolean, required: true },
  announcements: {
    items: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: undefined,
    },
    total: { type: Number, required: true },
  },
  likes: {
    items: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: undefined,
    },
    total: { type: Number, required: true },
  },
  created: { type: Date, required: true },
  updated: { type: Date, required: true },
});

export const NoteModel = mongoose.model("Note", NoteSchema);
