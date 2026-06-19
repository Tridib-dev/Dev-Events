import { HydratedDocument, Model, Schema, model, models } from "mongoose";

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

type EventDocument = HydratedDocument<IEvent>;
type EventModel = Model<IEvent>;
type RequiredStringField =
  | "title"
  | "description"
  | "overview"
  | "image"
  | "venue"
  | "location"
  | "date"
  | "time"
  | "mode"
  | "audience"
  | "organizer";

const REQUIRED_STRING_FIELDS: RequiredStringField[] = [
  "title",
  "description",
  "overview",
  "image",
  "venue",
  "location",
  "date",
  "time",
  "mode",
  "audience",
  "organizer",
];

const createSlug = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeDateToIso = (value: string): string => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid event date. Use a valid date value.");
  }

  return parsedDate.toISOString();
};

const normalizeTime = (value: string): string => {
  const trimmed = value.trim();
  const twentyFourHourMatch = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);

  if (twentyFourHourMatch) {
    const [, hour, minutes] = twentyFourHourMatch;
    return `${hour.padStart(2, "0")}:${minutes}`;
  }

  const twelveHourMatch = trimmed.match(/^(\d{1,2})(?::([0-5]\d))?\s*(AM|PM)$/i);

  if (!twelveHourMatch) {
    throw new Error("Invalid event time. Use HH:mm or h:mm AM/PM.");
  }

  const rawHour = Number(twelveHourMatch[1]);
  const minutes = twelveHourMatch[2] ?? "00";
  const meridiem = twelveHourMatch[3].toUpperCase();

  if (rawHour < 1 || rawHour > 12) {
    throw new Error("Invalid event time hour.");
  }

  const hour24 = (rawHour % 12) + (meridiem === "PM" ? 12 : 0);
  return `${String(hour24).padStart(2, "0")}:${minutes}`;
};

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true, unique: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: {
      type: [{ type: String, trim: true }],
      required: true,
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "agenda must contain at least one item.",
      },
    },
    organizer: { type: String, required: true, trim: true },
    tags: {
      type: [{ type: String, trim: true }],
      required: true,
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "tags must contain at least one item.",
      },
    },
  },
  {
    timestamps: true,
  }
);



eventSchema.pre("save", function validateAndNormalizeEvent(this: EventDocument) {
  for (const field of REQUIRED_STRING_FIELDS) {
    const value = this[field];

    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`${field} is required and cannot be empty.`);
    }

    this[field] = value.trim();
  }

  if (!Array.isArray(this.agenda) || this.agenda.length === 0) {
    throw new Error("agenda must contain at least one item.");
  }

  this.agenda = this.agenda.map((item) => item.trim()).filter(Boolean);

  if (this.agenda.length === 0) {
    throw new Error("agenda must contain non-empty items.");
  }

  if (!Array.isArray(this.tags) || this.tags.length === 0) {
    throw new Error("tags must contain at least one item.");
  }

  this.tags = this.tags.map((item) => item.trim()).filter(Boolean);

  if (this.tags.length === 0) {
    throw new Error("tags must contain non-empty items.");
  }

  // Keep URLs stable by regenerating slug only when title changes.
  if (this.isModified("title") || !this.slug) {
    this.slug = createSlug(this.title);
  }

  if (!this.slug) {
    throw new Error("Unable to generate a valid slug from title.");
  }

  // Normalize date/time for consistent persistence and querying.
  this.date = normalizeDateToIso(this.date);
  this.time = normalizeTime(this.time);
});

const Event = (models.Event as EventModel | undefined) ?? model<IEvent>("Event", eventSchema);

export { Event };
export default Event;
