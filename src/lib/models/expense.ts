import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IExpense extends Document {
  date: Date;
  categoryId: Types.ObjectId;
  sourceId: Types.ObjectId;
  amount: number;
  comment?: string;
  createdAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    date: { type: Date, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    sourceId: { type: Schema.Types.ObjectId, ref: 'Source', required: true },
    amount: { type: Number, required: true, min: 0 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

const Expense: Model<IExpense> =
  mongoose.models.Expense ?? mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
