import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { StudyTask, FocusSession, StudyPlan } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const taskService = {
  subscribeTasks: (userId: string, callback: (tasks: StudyTask[]) => void) => {
    const q = query(
      collection(db, 'tasks'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyTask));
      callback(tasks);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'tasks'));
  },

  addTask: async (task: Omit<StudyTask, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        ...task,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  },

  toggleTask: async (taskId: string, completed: boolean) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), { completed });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${taskId}`);
    }
  }
};

export const sessionService = {
  subscribeSessions: (userId: string, callback: (sessions: FocusSession[]) => void) => {
    const q = query(
      collection(db, 'sessions'), 
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FocusSession));
      callback(sessions);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'sessions'));
  },

  addSession: async (session: Omit<FocusSession, 'id'>) => {
    try {
      await addDoc(collection(db, 'sessions'), session);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'sessions');
    }
  }
};

export const planService = {
  subscribePlans: (userId: string, callback: (plans: StudyPlan[]) => void) => {
    const q = query(
      collection(db, 'plans'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyPlan));
      callback(plans);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'plans'));
  },

  savePlan: async (plan: Omit<StudyPlan, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'plans'), {
        ...plan,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'plans');
    }
  }
};
