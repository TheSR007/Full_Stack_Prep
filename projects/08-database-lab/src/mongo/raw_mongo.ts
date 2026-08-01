import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { config } from '../config/config';

export interface MongoTaskDoc {
  _id?: ObjectId;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  tags: string[];
  subtasks: { id: string; title: string; is_completed: boolean }[];
  created_at: Date;
  updated_at: Date;
}

export class RawMongoLab {
  private client: MongoClient;
  private db!: Db;
  private tasksCollection!: Collection<MongoTaskDoc>;

  constructor(uri?: string) {
    const mongoUri = uri || config.mongo.uri;
    this.client = new MongoClient(mongoUri);
  }

  public async connect(dbName: string = config.mongo.dbName): Promise<void> {
    await this.client.connect();
    this.db = this.client.db(dbName);
    this.tasksCollection = this.db.collection<MongoTaskDoc>('tasks');

    // Create Indexes for search and fast retrieval
    await this.tasksCollection.createIndex({ title: 'text', description: 'text' });
    await this.tasksCollection.createIndex({ status: 1, priority: 1 });
    await this.tasksCollection.createIndex({ category: 1 });
    await this.tasksCollection.createIndex({ tags: 1 });
  }

  public async insertTask(task: Omit<MongoTaskDoc, '_id' | 'created_at' | 'updated_at'>): Promise<ObjectId> {
    const doc: MongoTaskDoc = {
      ...task,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const res = await this.tasksCollection.insertOne(doc as any);
    return res.insertedId;
  }

  // Real-life MongoDB Use Case: Aggregation Pipeline for Analytics Dashboard
  public async getAnalyticsAggregation(): Promise<any> {
    const pipeline = [
      {
        $facet: {
          totalCount: [{ $count: 'total' }],
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
          categoryStats: [
            { $group: { _id: '$category', avgSubtasks: { $avg: { $size: '$subtasks' } }, totalTasks: { $sum: 1 } } },
          ],
        },
      },
    ];

    const results = await this.tasksCollection.aggregate(pipeline).toArray();
    return results[0];
  }

  // Real-life MongoDB Use Case: Embedded Subtask Operations ($push / $set positional operator)
  public async addSubtask(taskId: string, title: string): Promise<boolean> {
    const res = await this.tasksCollection.updateOne(
      { _id: new ObjectId(taskId) },
      {
        $push: {
          subtasks: {
            id: new ObjectId().toHexString(),
            title,
            is_completed: false,
          },
        },
        $set: { updated_at: new Date() },
      }
    );
    return res.modifiedCount > 0;
  }

  public async searchTasksText(query: string): Promise<MongoTaskDoc[]> {
    return this.tasksCollection.find({ $text: { $search: query } }).toArray();
  }

  public async close(): Promise<void> {
    await this.client.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('raw_mongo.ts')) {
  (async () => {
    console.log('[MongoDB Raw] Testing Native Mongo Driver...');
    const lab = new RawMongoLab();
    try {
      await lab.connect();
      const id = await lab.insertTask({
        title: 'MongoDB Native Pipeline Lab',
        description: 'Demonstrating embedded array operations and aggregation pipelines',
        status: 'in_progress',
        priority: 'high',
        category: 'NoSQL Lab',
        tags: ['mongodb', 'nosql', 'aggregation'],
        subtasks: [{ id: 'sub-1', title: 'Setup Mongo Client', is_completed: true }],
      });
      console.log('[MongoDB Raw] Inserted Document ID:', id.toHexString());

      const analytics = await lab.getAnalyticsAggregation();
      console.log('[MongoDB Raw] Aggregation Pipeline Results:', JSON.stringify(analytics, null, 2));
    } catch (e: any) {
      console.error('[MongoDB Raw] Note: MongoDB connection skipped if not running locally:', e.message);
    } finally {
      await lab.close();
    }
  })();
}