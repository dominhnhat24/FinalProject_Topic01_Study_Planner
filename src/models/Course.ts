import { Schema, model, type InferSchemaType } from "mongoose";

const courseSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    code: { type: String, required: true, trim: true, maxlength: 30 },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    color: { type: String, required: true, default: "#4F46E5", match: /^#[0-9A-Fa-f]{6}$/ },
  },
  { timestamps: true, versionKey: false }
);

courseSchema.index({ userId: 1, code: 1 }, { unique: true });

export type CourseDocument = InferSchemaType<typeof courseSchema>;
export const Course = model("Course", courseSchema);
