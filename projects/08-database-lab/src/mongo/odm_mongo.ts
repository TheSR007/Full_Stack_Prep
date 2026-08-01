import mongoose, { Schema, Document } from 'mongoose';
import { config } from '../config/config';

export interface IMongoTask extends Document {
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  tags: string[];
  subtasks: { id: string; title: string; is_completed: boolean }[];
  createdAt: Date;
  updatedAt: Date;
  // Virtual
  completionProgress: number;
}

const SubtaskSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  is_completed: { type: Boolean, default: false },
});

const TaskSchema = new Schema<IMongoTask>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'completed'],
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    category: { type: String, default: 'General', index: true },
    tags: [{ type: String, index: true }],
    subtasks: [SubtaskSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property calculation for completion percentage
TaskSchema.virtual('completionProgress').get(function (this: IMongoTask) {
  if (!this.subtasks || this.subtasks.length === 0) return this.status === 'completed' ? 100 : 0;
  const completed = this.subtasks.filter((st) => st.is_completed).length;
  return Math.round((completed / this.subtasks.length) * 100);
});

export const TaskModel = mongoose.model<IMongoTask>('Task', TaskSchema);

export class ODMMongoLab {
  private uri: string;

  constructor(uri?: string) {
    this.uri = uri || `${config.mongo.uri}/${config.mongo.dbName}_odm`;
  }

  public async connect(): Promise<void> {
    await mongoose.connect(this.uri);
  }

  public async create(data: Partial<IMongoTask>): Promise<IMongoTask> {
    const task = new TaskModel(data);
    return task.save();
  }

  public async findByFilter(filter: { status?: string; category?: string }): Promise<IMongoTask[]> {
    return TaskModel.find(filter).sort({ createdAt: -1 });
  }

  public async updateStatus(id: string, status: 'todo' | 'in_progress' | 'completed'): Promise<IMongoTask | null> {
    return TaskModel.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }
}

if (process.argv[1] && process.argv[1].endsWith('odm_mongo.ts')) {
  (async () => {
    console.log('[MongoDB ODM] Testing Mongoose ODM Model...');
    const lab = new ODMMongoLab();
    try {
      await lab.connect();
      const task = await lab.create({
        title: 'Mongoose Task ODM Test',
        description: 'Testing Mongoose schema validators and virtual progress calculation',
        status: 'in_progress',
        priority: 'high',
        category: 'ODM Lab',
        tags: ['mongoose', 'odm'],
        subtasks: [
          { id: '1', title: 'Subtask 1', is_completed: true },
          { id: '2', title: 'Subtask 2', is_completed: false },
        ],
      });
      console.log('[MongoDB ODM] Created Task ID:', task._id.toString());
      console.log('[MongoDB ODM] Completion Progress Virtual (%):', task.completionProgress);
    } catch (e: any) {
      console.error('[MongoDB ODM] Note: MongoDB connection skipped if not running locally:', e.message);
    } finally {
      await lab.disconnect();
    }
  })();
}