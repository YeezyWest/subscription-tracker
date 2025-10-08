import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subscription name is required"],
      trim: true,
      minlength: [3, "Subscription name must be at least 3 characters long"],
      maxlength: [30, "Subscription name must be at most 30 characters long"],
    },
    price: {
      type: Number,
      required: [true, "Subscription price is required"],
      min: [0, "Subscription price must be at least 0"],
      max: [10000, "Subscription price must be at most 10000"],
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP", "JPY", "NGN"],
      default: "USD",
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
      default: "monthly",
    },
    category: {
      type: String,
      enum: ["general", "entertainment", "education", "health"],
      required: [true, "Subscription category is required"],
    },
    paymentMethod: {
      type: String,
      required: [true, "Subscription payment method is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: (date) => date >= new Date(),
        message: "Start date must be in the future",
      },
    },
    renewalDate: {
      type: Date,

      validate: {
        validator: function (date) {
          return date > this.startDate;
        },
        message: "Renewal date must be in the future",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);
//auto-calculate renewal date if not provided
subscriptionSchema.pre("save", function (next) {
  if (!this.renewalDate) {
    const start = new Date(this.startDate);
    const nextRenewal = new Date(start);
    switch (this.frequency) {
      case "daily":
        nextRenewal.setDate(start.getDate() + 1);
        break;
      case "weekly":
        nextRenewal.setDate(start.getDate() + 7);
        break;
      case "monthly":
        nextRenewal.setMonth(start.getMonth() + 1);
        break;
      case "yearly":
        nextRenewal.setFullYear(start.getFullYear() + 1);
        break;
      default:
        // Fallback to one month if frequency is somehow invalid
        nextRenewal.setMonth(start.getMonth() + 1);
    }
    this.renewalDate = nextRenewal;
  }
  next();
});

//auto-update status to expired if renewal date is in the past
subscriptionSchema.pre("save", function (next) {
  if (this.status === "active" && this.renewalDate <= Date.now()) {
    this.status = "expired";
  }
  next();
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
