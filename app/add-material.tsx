// app/add-material.tsx

import React from 'react';
import AddMaterialScreen from '../src/screens/AddMaterialScreen';
import { TextItem } from '../src/types';

export default function AddMaterialRoute() {
  const handleMaterialAdded = (material: Partial<TextItem>) => {
    // TODO: グローバル状態管理(Zustand)に追加する処理を実装
    console.log('Material added:', material);
  };

  return (
    <AddMaterialScreen onMaterialAdded={handleMaterialAdded} />
  );
}