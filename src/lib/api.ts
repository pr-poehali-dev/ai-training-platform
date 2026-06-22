export const API = {
  models: 'https://functions.poehali.dev/e98766c9-3189-4809-9346-2a8a27a4471f',
  mcp: 'https://functions.poehali.dev/da82d6f7-8363-4008-953c-7ddfe5b61363',
  datasets: 'https://functions.poehali.dev/a6e29ed6-c962-41f8-a73b-5963c281562f',
};

export interface ModelRow {
  id: number;
  name: string;
  task: string;
  baseModel: string;
  epochs: number;
  datasetUrl: string;
  status: string;
  progress: number;
  notebookUrl: string;
  createdAt: string;
}

export interface DatasetRow {
  id: number;
  name: string;
  fileUrl: string;
  sizeBytes: number;
  createdAt: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadDataset(file: File): Promise<DatasetRow> {
  const content = await fileToBase64(file);
  const res = await fetch(API.datasets, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: file.name,
      content,
      fileType: file.name.split('.').pop() || 'csv',
    }),
  });
  if (!res.ok) throw new Error('upload failed');
  return res.json();
}

export async function listModels(): Promise<ModelRow[]> {
  const res = await fetch(API.models);
  const data = await res.json();
  return data.models || [];
}

export async function createModel(payload: {
  name: string;
  task: string;
  baseModel: string;
  epochs: number;
  datasetUrl?: string;
  notebookUrl?: string;
}): Promise<ModelRow> {
  const res = await fetch(API.models, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
