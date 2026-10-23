import { Schema, model, type InferSchemaType } from "mongoose";

const attachmentSchema = new Schema(
  {
    uri: { type: String, required: true, maxlength: 2048 },
    fileName: { type: String, default: "", maxlength: 255 },
  },
  { _id: true }
);

const assignmentSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    dueAt: { type: Date, required: true },
    status: { type: String, enum: ["pending", "completed"], default: "pending", required: true },
    notes: { type: String, default: "", maxlength: 5000 },
    attachments: { type: [attachmentSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

assignmentSchema.index({ courseId: 1, dueAt: 1 });
assignmentSchema.index({ courseId: 1, status: 1, dueAt: 1 });

export type AssignmentDocument = InferSchemaType<typeof assignmentSchema>;
export const Assignment = model("Assignment", assignmentSchema);
