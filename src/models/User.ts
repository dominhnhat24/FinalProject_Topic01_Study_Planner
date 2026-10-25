  import { Schema, model, type InferSchemaType } from "mongoose";

  const userSchema = new Schema(
    {
      name: { type: String, required: true, trim: true, maxlength: 100 },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
      passwordHash: { type: String, required: true, select: false },
      timezone: { type: String, required: true, default: "Asia/Ho_Chi_Minh" },
    },
    { timestamps: true, versionKey: false }
  );

  export type UserDocument = InferSchemaType<typeof userSchema>;
  export const User = model("User", userSchema);
