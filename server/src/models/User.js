const { Schema, model } = require("mongoose");

const roles = [
  "admin",
  "doctor",
  "nurse",
  "receptionist",
  "lab_staff",
  "patient",
];

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    full_name: { type: String, required: true, trim: true },
    role: { type: String, enum: roles, default: "patient" },
    password_hash: { type: String, required: true },
    phone: { type: String },
    is_active: { type: Boolean, default: true },
    department_id: { type: String },
    specialization_id: { type: String },
    profile_image_url: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.password_hash;
    return ret;
  },
});

module.exports = model("User", userSchema);
