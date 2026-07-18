const { Schema, model } = require("mongoose");

const patientSchema = new Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    date_of_birth: { type: String, required: true },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postal_code: { type: String },
    country: { type: String },
    blood_group: { type: String },
    patient_mrn: { type: String },
    medical_history: { type: String },
    allergies: { type: String },
    chronic_conditions: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

patientSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = model("Patient", patientSchema);
