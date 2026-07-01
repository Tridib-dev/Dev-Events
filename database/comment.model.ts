import { HydratedDocument, Model, Schema, model, models, Types } from "mongoose";

export interface IComment {
  eventId: Types.ObjectId;
  userId: string;           // Clerk user ID
  userName: string;
  userImage?: string;
  content: string;
  likes: string[];
  createdAt: Date;
}

const commentSchema = new Schema<IComment>({
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userImage: { type: String },
  content: { type: String, required: true, trim: true, maxlength: 500 },
  likes: [{ type: String }],   // userIds
}, { timestamps: true });

commentSchema.index({ eventId: 1, createdAt: -1 });

const Comment = models.Comment as Model<IComment> ?? model<IComment>("Comment", commentSchema);

export { Comment };
export default Comment;