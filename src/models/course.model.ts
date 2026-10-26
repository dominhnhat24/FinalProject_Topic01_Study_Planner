import mongoose, { type InferSchemaType } from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 1,
      maxlength: 30,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 150,
    },
    color: {
      type: String,
      required: true,
      default: "#4F46E5",
      match: /^#[0-9A-Fa-f]{6}$/,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

courseSchema.index({ userId: 1, code: 1 }, { unique: true });
courseSchema.index({ userId: 1, name: 1 });

export type CourseDocument = InferSchemaType<typeof courseSchema>;
export const Course = mongoose.model("Course", courseSchema);
