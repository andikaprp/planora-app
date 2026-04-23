import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import type { ReactNode } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';

export type AppDatabase = Pick<
  SQLiteDatabase,
  'execAsync' | 'getAllAsync' | 'getFirstAsync' | 'runAsync' | 'withTransactionAsync'
>;

type DatabaseProviderProps = {
  children: ReactNode;
  databaseName: string;
  onInit?: (db: AppDatabase) => Promise<void> | void;
};

export function DatabaseProvider({ children, databaseName, onInit }: DatabaseProviderProps) {
  return (
    <SQLiteProvider
      databaseName={databaseName}
      onInit={
        onInit
          ? async (db) => {
              await onInit(db as AppDatabase);
            }
          : undefined
      }>
      {children}
    </SQLiteProvider>
  );
}

export function useAppDatabase() {
  return useSQLiteContext() as AppDatabase;
}
