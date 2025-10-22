const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Comment model for a social media app
 *
 * - author: reference to User
 * - post: reference to Post (or parent entity)
 * - parentComment: reference for threaded replies
 * - content: main text body
 * - attachments: optional media attachments
 * - likes: list of user refs (can be large; consider storing count + separate collection for scale)
 * - reactions: small array of { user, type } for arbitrary reaction types
 * - deleted/edited flags, timestamps
 *
 * Exposes virtuals: likeCount, replyCount
 * Includes basic instance methods to manipulate likes/reactions.
 */

const AttachmentSchema = new Schema({
    url: { type: String, required: true },
    type: {
        type: String,
        enum: ['image', 'video', 'link', 'file', 'unknown'],
        default: 'unknown'
    },
    metadata: { type: Schema.Types.Mixed } // width/height/duration etc.
}, { _id: false });

const ReactionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true } // e.g. 'like', 'love', 'haha', 'sad', etc.
}, { _id: false });

const CommentSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    attachments: { type: [AttachmentSchema], default: [] },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }], // simple like list
    reactions: { type: [ReactionSchema], default: [] }, // other reactions
    pinned: { type: Boolean, default: false },
    edited: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    // optional moderation fields
    reports: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true,
    toJSON: { virtuals: true, transform(doc, ret) {
        delete ret.__v;
        if (ret.deleted) {
            // hide content for deleted comments
            ret.content = null;
            ret.attachments = [];
        }
        return ret;
    }},
    toObject: { virtuals: true }
});

// Virtuals
CommentSchema.virtual('likeCount').get(function() {
    return this.likes ? this.likes.length : 0;
});

CommentSchema.virtual('replyCount').get(async function() {
    // Note: virtual asyncs are not directly supported; this is a placeholder if you wish to populate later.
    return this._replyCount || 0;
});

// Index text for simple search
CommentSchema.index({ content: 'text' });

// Instance methods
CommentSchema.methods.hasLiked = function(userId) {
    if (!userId) return false;
    return this.likes.some(id => id.equals ? id.equals(userId) : id.toString() === userId.toString());
};

CommentSchema.methods.addLike = function(userId) {
    if (!userId) return this;
    if (!this.hasLiked(userId)) this.likes.push(userId);
    return this;
};

CommentSchema.methods.removeLike = function(userId) {
    if (!userId) return this;
    this.likes = this.likes.filter(id => !(id.equals ? id.equals(userId) : id.toString() === userId.toString()));
    return this;
};

CommentSchema.methods.addReaction = function(userId, type) {
    if (!userId || !type) return this;
    // replace existing reaction by same user
    this.reactions = this.reactions.filter(r => !(r.user.equals ? r.user.equals(userId) : r.user.toString() === userId.toString()));
    this.reactions.push({ user: userId, type });
    return this;
};

CommentSchema.methods.removeReaction = function(userId) {
    if (!userId) return this;
    this.reactions = this.reactions.filter(r => !(r.user.equals ? r.user.equals(userId) : r.user.toString() === userId.toString()));
    return this;
};

// Soft-delete helper
CommentSchema.methods.softDelete = function() {
    this.deleted = true;
    this.deletedAt = new Date();
    this.content = ''; // optionally scrub content
    this.attachments = [];
    return this;
};

// Pre remove: consider cascading deletes for replies in application logic if needed
// e.g., CommentSchema.pre('remove', async function(next) { ... });

module.exports = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);