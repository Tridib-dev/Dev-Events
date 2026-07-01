'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createComment, getEventComments, toggleLikeComment } from '@/lib/actions/comment.actions';
import { toast } from 'sonner';
import Image from 'next/image';

interface Comment {
  _id: string;
  userName: string;
  userImage?: string;
  content: string;
  likes: string[];
  createdAt: string;
}

interface CommentSectionProps {
  eventId: string;
}

const CommentSection = ({ eventId }: CommentSectionProps) => {
  const { user, isSignedIn } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    const fetched = await getEventComments(eventId);
    setComments(fetched.map((c: any) => ({
      _id: c._id.toString(),
      userName: c.userName,
      userImage: c.userImage,
      content: c.content,
      likes: c.likes || [],
      createdAt: c.createdAt,
    })));
  };

  useEffect(() => {
    fetchComments();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!isSignedIn) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setIsSubmitting(true);

    const result = await createComment(eventId, newComment);

    if (result.success) {
      setNewComment("");
      toast.success("Comment posted!");
      fetchComments();
    } else {
      toast.error(result.error || "Failed to post comment");
    }

    setIsSubmitting(false);
  };

  const handleLike = async (commentId: string) => {
    if (!isSignedIn) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    const result = await toggleLikeComment(commentId);
    if (result.success) {
      fetchComments();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-semibold mb-8">Discussion ({comments.length})</h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-12">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts about this event..."
          className="w-full bg-zinc-900 border border-white/10 rounded-3xl p-6 text-white placeholder:text-white/50 focus:outline-none focus:border-white/30 min-h-[140px]"
          disabled={isSubmitting}
        />
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="bg-white text-black px-8 py-3 rounded-2xl font-semibold hover:bg-white/90 transition disabled:opacity-50"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-10">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const hasLiked = comment.likes.includes(user?.id || "");
            return (
              <div key={comment._id} className="flex gap-5">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700 flex-shrink-0">
                  {comment.userImage && <Image src={comment.userImage} alt={comment.userName} width={40} height={40} />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{comment.userName}</p>
                      <p className="text-xs text-white/50">{new Date(comment.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <p className="text-white/80 mt-2 leading-relaxed">{comment.content}</p>

                  <button
                    onClick={() => handleLike(comment._id)}
                    className={`mt-3 flex items-center gap-1.5 text-sm transition ${hasLiked ? 'text-pink-400' : 'text-white/60 hover:text-white'}`}
                  >
                    ❤️ <span>{comment.likes.length}</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-white/50 text-center py-20">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;