import mongoose from "mongoose";

const listSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "List title is required"],
      trim: true,
      minlength: [2, "List title must be at least 2 characters long"],
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const List = mongoose.model("List", listSchema);

export default List;
