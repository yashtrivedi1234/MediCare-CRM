const { Schema, model } = require("mongoose");

const appointmentSchema = new Schema(
  {
    patient_id: { type: String, required: true },
    doctor_id: { type: String, required: true },
    scheduled_date: { type: String, required: true },
    scheduled_time: { type: String, required: true },
    appointment_type: {
      type: String,
      enum: ["opd", "ipd", "walk_in", "follow_up"],
      default: "opd",
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no_show", "rescheduled"],
      default: "scheduled",
    },
    reason_for_visit: { type: String },
    token_number: { type: Number },
    consultation_fee: { type: Number },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

appointmentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = model("Appointment", appointmentSchema);
