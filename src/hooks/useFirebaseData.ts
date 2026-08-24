import { useEffect, useState } from "react";
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Expense, Goal, Task, TaskList, UserProfile, SupermarketProduct } from "../types";
import { useAuthState } from "react-firebase-hooks/auth";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setExpenses([]);
      return;
    }
    const q = query(collection(db, "expenses"), where("userId", "==", user.uid));
    return onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "expenses");
    });
  }, [user, loading]);

  const addExpense = async (expense: Omit<Expense, "id" | "userId" | "createdAt">) => {
    if (!user) return;
    try {
      return await addDoc(collection(db, "expenses"), {
        ...expense,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "expenses");
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      return await deleteDoc(doc(db, "expenses", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "expenses");
    }
  };

  const updateExpense = async (id: string, data: Partial<Expense>) => {
    try {
      return await updateDoc(doc(db, "expenses", id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "expenses");
    }
  };

  return { expenses, addExpense, deleteExpense, updateExpense };
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setGoals([]);
      return;
    }
    const q = query(collection(db, "goals"), where("userId", "==", user.uid));
    return onSnapshot(q, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "goals");
    });
  }, [user, loading]);

  const saveGoal = async (goal: Omit<Goal, "id" | "userId" | "updatedAt">) => {
    if (!user) return;
    try {
      return await addDoc(collection(db, "goals"), {
        ...goal,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "goals");
    }
  };

  return { goals, saveGoal };
}

export function useTasks() {
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setTaskLists([]);
      setTasks([]);
      return;
    }
    const qLists = query(collection(db, "taskLists"), where("userId", "==", user.uid));
    const unsubLists = onSnapshot(qLists, (snapshot) => {
      setTaskLists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskList)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "taskLists");
    });

    const qTasks = query(collection(db, "tasks"), where("userId", "==", user.uid));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "tasks");
    });

    return () => {
      unsubLists();
      unsubTasks();
    };
  }, [user, loading]);

  const addTaskList = async (name: string) => {
    if (!user) return;
    try {
      return await addDoc(collection(db, "taskLists"), {
        userId: user.uid,
        name,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "taskLists");
    }
  };

  const addTask = async (task: Omit<Task, "id" | "userId" | "createdAt" | "completed">) => {
    if (!user) return;
    try {
      return await addDoc(collection(db, "tasks"), {
        ...task,
        userId: user.uid,
        completed: false,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "tasks");
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      return await updateDoc(doc(db, "tasks", taskId), {
        completed,
        completedAt: completed ? new Date().toISOString() : null
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "tasks");
    }
  };

  const updateTask = async (taskId: string, data: Partial<Task>) => {
    try {
      return await updateDoc(doc(db, "tasks", taskId), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "tasks");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      return await deleteDoc(doc(db, "tasks", taskId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "tasks");
    }
  };

  return { taskLists, tasks, addTaskList, addTask, toggleTask, deleteTask, updateTask };
}

export function useSupermarketProducts() {
  const [products, setProducts] = useState<SupermarketProduct[]>([]);
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setProducts([]);
      return;
    }
    const q = query(collection(db, "supermarketProducts"), where("userId", "==", user.uid));
    return onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupermarketProduct)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "supermarketProducts");
    });
  }, [user, loading]);

  const addProduct = async (product: Omit<SupermarketProduct, "id" | "userId" | "createdAt">) => {
    if (!user) return;
    try {
      return await addDoc(collection(db, "supermarketProducts"), {
        ...product,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "supermarketProducts");
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      return await deleteDoc(doc(db, "supermarketProducts", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "supermarketProducts");
    }
  };

  return { products, addProduct, deleteProduct };
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setProfile(null);
      return;
    }
    const profileDoc = doc(db, "users", user.uid);
    return onSnapshot(profileDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        let newStreak = data.streak || 1;
        let needsUpdate = false;
        
        if (data.lastActive) {
          const now = new Date();
          const lastActiveDate = new Date(data.lastActive);
          
          const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
          const lastActiveUtc = Date.UTC(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate());
          const diffDays = Math.floor((nowUtc - lastActiveUtc) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
            needsUpdate = true;
          } else if (diffDays > 1) {
            newStreak = 1;
            needsUpdate = true;
          } else if (!data.lastActive) {
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            updateDoc(profileDoc, {
              streak: newStreak,
              lastActive: now.toISOString()
            }).catch(console.error);
          }
        } else {
          // No lastActive, update it
          updateDoc(profileDoc, {
            lastActive: new Date().toISOString()
          }).catch(console.error);
        }

        setProfile({ userId: snapshot.id, ...data, streak: needsUpdate ? newStreak : data.streak } as UserProfile);
      } else {
        // Initialize profile
        const initialProfile: UserProfile = {
          userId: user.uid,
          name: user.displayName || "Usuário",
          email: user.email || "",
          achievements: [],
          referralCount: 0,
          streak: 1,
          lastActive: new Date().toISOString(),
          isPublic: false
        };
        setDoc(profileDoc, initialProfile).catch((error) => {
          handleFirestoreError(error, OperationType.WRITE, "users");
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "users");
    });
  }, [user, loading]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      return await updateDoc(doc(db, "users", user.uid), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "users");
    }
  };

  const addAchievement = async (achievementId: string) => {
    if (!user || !profile) return;
    if (profile.achievements.includes(achievementId)) return;
    try {
      return await updateDoc(doc(db, "users", user.uid), {
        achievements: [...profile.achievements, achievementId]
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "users");
    }
  };

  return { profile, updateProfile, addAchievement };
}
