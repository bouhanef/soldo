import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISource extends Document {
  name: string;
  isActive: boolean;
}

const SourceSchema = new Schema<ISource>(
  {
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Source: Model<ISource> =
  mongoose.models.Source ?? mongoose.model<ISource>('Source', SourceSchema);

export default Source;
