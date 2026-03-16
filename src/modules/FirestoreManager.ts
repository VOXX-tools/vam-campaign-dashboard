/**
 * FirestoreManager - Firestoreデータ永続化モジュール
 * 
 * キャンペーンデータと時系列データをFirestoreに保存・読み込みします。
 * チーム全体でデータを共有できます。
 * 90日以上前のデータは自動的に削除されます。
 * 
 * Requirements: 12.1-12.4
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  Timestamp,
  Firestore,
} from 'firebase/firestore';
import type { StorageData, TimeSeriesDataPoint } from '../types';

const COLLECTION_CAMPAIGNS = 'campaigns';
const COLLECTION_TIMESERIES = 'timeseries';
const DATA_RETENTION_DAYS = 60; // 2ヶ月分のデータを保存（コスト最適化）

export class FirestoreManager {
  private db: Firestore;
  private app: FirebaseApp;

  constructor() {
    // Firebase設定
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    // Firebase初期化（既に初期化されている場合は再利用）
    if (getApps().length === 0) {
      this.app = initializeApp(firebaseConfig);
    } else {
      this.app = getApps()[0];
    }

    this.db = getFirestore(this.app);
  }

  /**
   * キャンペーンデータを保存
   * Requirements: 12.1
   */
  async save(data: StorageData): Promise<void> {
    try {
      const docRef = doc(this.db, COLLECTION_CAMPAIGNS, 'latest');
      await setDoc(docRef, {
        campaigns: data.campaigns,
        timestamp: Timestamp.fromDate(data.timestamp),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to save campaign data to Firestore:', error);
      throw new Error('Firestore save failed');
    }
  }

  /**
   * キャンペーンデータを読み込み
   * Requirements: 12.1
   */
  async load(): Promise<StorageData | null> {
    try {
      const docRef = doc(this.db, COLLECTION_CAMPAIGNS, 'latest');
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        campaigns: data.campaigns,
        timestamp: data.timestamp.toDate(),
      };
    } catch (error) {
      console.error('Failed to load campaign data from Firestore:', error);
      return null;
    }
  }

  /**
   * 時系列データポイントを保存
   * Requirements: 12.1
   */
  async saveTimeSeries(dataPoint: TimeSeriesDataPoint): Promise<void> {
    try {
      // タイムスタンプをドキュメントIDとして使用（重複を防ぐ）
      const docId = dataPoint.timestamp.getTime().toString();
      const docRef = doc(this.db, COLLECTION_TIMESERIES, docId);

      await setDoc(docRef, {
        timestamp: Timestamp.fromDate(dataPoint.timestamp),
        totalImp: dataPoint.totalImp,
        reservedImp: dataPoint.reservedImp,
        programmaticImp: dataPoint.programmaticImp,
        houseImp: dataPoint.houseImp,
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to save time series data to Firestore:', error);
      throw new Error('Firestore save failed');
    }
  }

  /**
   * 時系列データを読み込み
   * Requirements: 12.1, 12.4
   */
  async loadTimeSeries(): Promise<TimeSeriesDataPoint[]> {
    try {
      const q = query(
        collection(this.db, COLLECTION_TIMESERIES),
        orderBy('timestamp', 'desc'),
        limit(1440) // 60日 × 24時間 = 1440データポイント
      );

      const querySnapshot = await getDocs(q);
      const dataPoints: TimeSeriesDataPoint[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        dataPoints.push({
          timestamp: data.timestamp.toDate(),
          totalImp: data.totalImp || 0,
          reservedImp: data.reservedImp || 0,
          programmaticImp: data.programmaticImp || 0,
          houseImp: data.houseImp || 0,
        });
      });

      // 時系列順にソート（古い順）
      return dataPoints.reverse();
    } catch (error) {
      console.error('Failed to load time series data from Firestore:', error);
      return [];
    }
  }

  /**
   * 60日以上前のデータを削除
   * Requirements: 12.2, 12.3
   */
  async cleanup(): Promise<void> {
    try {
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000);
      const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

      // 時系列データのクリーンアップ
      const q = query(
        collection(this.db, COLLECTION_TIMESERIES),
        where('timestamp', '<', cutoffTimestamp)
      );

      const querySnapshot = await getDocs(q);
      const deletePromises: Promise<void>[] = [];

      querySnapshot.forEach((docSnapshot) => {
        deletePromises.push(deleteDoc(docSnapshot.ref));
      });

      await Promise.all(deletePromises);

      console.log(`Cleaned up ${deletePromises.length} old time series data points`);
    } catch (error) {
      console.error('Failed to cleanup old data from Firestore:', error);
    }
  }
}
