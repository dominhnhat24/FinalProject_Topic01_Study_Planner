import mongoose, { type InferSchemaType } from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    uri: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    fileName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 255,
    },
  },
  { _id: true },
);

const assignmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    dueAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
      required: true,
      index: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

assignmentSchema.index({ userId: 1, dueAt: 1 });
assignmentSchema.index({ userId: 1, courseId: 1, status: 1, dueAt: 1 });

export type AssignmentDocument = InferSchemaType<typeof assignmentSchema>;
export const Assignment = mongoose.model("Assignment", assignmentSchema);
