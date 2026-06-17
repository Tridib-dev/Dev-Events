import { HydratedDocument, Model, Schema, Types, model, models } from "mongoose";
import Event from "./event.model";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

type BookingDocument = HydratedDocument<IBooking>;
type BookingModel = Model<IBooking>;

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => EMAIL_REGEX.test(value),
        message: "Invalid email format.",
      },
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ eventId: 1 });

bookingSchema.pre("save", async function validateBooking(this: BookingDocument) {
  this.email = this.email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(this.email)) {
    throw new Error("Invalid email format.");
  }

  // Ensure each booking references a real event document.
  if (this.isModified("eventId")) {
    const eventExists = await Event.exists({ _id: this.eventId });

    if (!eventExists) {
      throw new Error("Cannot create booking: referenced event does not exist.");
    }
  }
});

const Booking = (models.Booking as BookingModel | undefined) ?? model<IBooking>("Booking", bookingSchema);

export { Booking };
export default Booking;
