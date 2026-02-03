"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanHistory = void 0;
const mongoose_1 = require("mongoose");
const loanHistorySchema = new mongoose_1.Schema({
    loanId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Loan',
        required: true,
        index: true,
    },
    changedByUserId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    changedAt: {
        type: Date,
        default: Date.now,
    },
    changes: [
        {
            field: {
                type: String,
                enum: ['dueDate', 'interestAmount'],
                required: true,
            },
            oldValue: {
                type: mongoose_1.Schema.Types.Mixed,
                required: true,
            },
            newValue: {
                type: mongoose_1.Schema.Types.Mixed,
                required: true,
            },
        },
    ],
    note: {
        type: String,
        default: '',
    },
}, { timestamps: true });
loanHistorySchema.index({ loanId: 1, changedAt: -1 });
exports.LoanHistory = (0, mongoose_1.model)('LoanHistory', loanHistorySchema);
//# sourceMappingURL=LoanHistory.model.js.map