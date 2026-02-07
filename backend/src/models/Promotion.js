const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    content: [{
        type: {
            type: String,
            enum: ['text', 'program_info', 'combo', 'note', 'conditions'],
            required: true
        },
        value: String,
        duration: {
            from: Date,
            to: Date
        },
        name: String,
        options: [{
            items: String,
            price: {
                type: Number,
                required: true
            }
        }],
        list: [String]
    }],
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true
    },
    minAmount: {
        type: Number,
        required: true
    },
    maxDiscount: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    maxUsage: {
        type: Number,
        required: true
    },
    currentUsage: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active'
    },
    category: {
        type: String,
        required: true
    },
    applicableMovies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
    }],
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Watercorn'
    }],
    userGroups: [{
        type: String
    }],
    related: [{
        title: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        }
    }],
    shareCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for better query performance
promotionSchema.index({ createdAt: -1 });
promotionSchema.index({ code: 1 });
promotionSchema.index({ status: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });

const Promotion = mongoose.model('promotions', promotionSchema);

module.exports = Promotion; 