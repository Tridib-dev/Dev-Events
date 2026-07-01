'use server';

import connectToDatabase from "@/lib/mongodb";
import { Comment } from "@/database/comment.model";
import { auth, currentUser } from "@clerk/nextjs/server";

export const createComment = async (eventId: string, content: string) => {
  try {
    const { userId } = await auth();
    const user = await currentUser();   // ← Use currentUser()

    if (!userId || !user) {
      return { success: false, error: "You must be signed in to comment" };
    }

    await connectToDatabase();

    const comment = await Comment.create({
      eventId,
      userId,
      userName: user.fullName || user.username || "Anonymous",
      userImage: user.imageUrl,
      content: content.trim(),
    });

    return { success: true, comment };
  } catch (error) {
    console.error("Comment creation failed:", error);
    return { success: false, error: "Failed to post comment" };
  }
};

export const getEventComments = async (eventId: string) => {
  try {
    await connectToDatabase();
    const comments = await Comment.find({ eventId }).sort({ createdAt: -1 });
    
    // Convert to plain objects
    return JSON.parse(JSON.stringify(comments));
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return [];
  }
};
export const toggleLikeComment = async (commentId: string) => {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await connectToDatabase();

    const comment = await Comment.findById(commentId);
    if (!comment) return { success: false, error: "Comment not found" };

    const hasLiked = comment.likes.includes(userId);

    if (hasLiked) {
      comment.likes = comment.likes.filter((id: string) => id !== userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    return { success: true, likesCount: comment.likes.length };
  } catch (error) {
    return { success: false, error: "Failed to like comment" };
  }
};