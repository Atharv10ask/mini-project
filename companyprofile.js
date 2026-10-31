
const mongoose = require("mongoose");

const companyProfileSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    industryType: {
      type: String,
      required: true
    },
    companySize: {
      type: String,
      required: true
    },
    establishedYear: {
      type: Number,
      required: true
    },
    website: {
      type: String,
      default: ""
    },
    phone: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    technologies: {
      type: [String],
      default: []
    },
    expertise: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.CompanyProfile ||
  mongoose.model("CompanyProfile", companyProfileSchema);
