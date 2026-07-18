const { Schema, model } = require("mongoose");

const labOrderSchema = new Schema(
  {
    patient_id: { type: String, required: true },
    doctor_id: { type: String },
    test_name: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    urgency: { type: String, enum: ["routine", "urgent"], default: "routine" },
    order_date: { type: String, required: true },
    specimen_collected_at: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

labOrderSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = model("LabOrder", labOrderSchema);
