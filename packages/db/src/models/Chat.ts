import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  message: string;
  userId: string;
  roomId: string;
}

const ChatSchema = new Schema<IChat>({
  message: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  roomId: {
    type: String,
    required: true,
    ref: 'Room',
  },
}, {
  timestamps: true,
});

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);