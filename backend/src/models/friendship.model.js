import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// requester and recipient can only exist once
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// check if the requester and recipient is same person
friendshipSchema.pre("validate", function (next) {
  if (this.requester.equals(this.recipient)) {
    return next(new Error("You cannot send a friend request to yourself"));
  }
  next();
});

const Friendship =
  mongoose.models.Friendship || mongoose.model("Friendship", friendshipSchema);

export default Friendship;
