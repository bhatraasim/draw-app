import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  slug: string;
  createdAt: Date;
  adminId: string;
}

const RoomSchema = new Schema<IRoom>({
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  adminId: {
    type: String,
    required: true,
    ref: 'User',
  },
}, {
  timestamps: true,
});

export const Room = mongoose.model<IRoom>('Room', RoomSchema);