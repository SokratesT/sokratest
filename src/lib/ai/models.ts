// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: "llama3.1",
    label: "Llama 3.1",
    apiIdentifier: "llama3.1",
    description: "Local Llama",
  },
] as const;

export const DEFAULT_MODEL: Model = {
  id: "llama3.1",
  label: "Llama 3.1",
  apiIdentifier: "llama3.1",
  description: "Local Llama",
};
