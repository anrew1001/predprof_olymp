export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserOut {
  id: number;
  first_name: string;
  last_name: string;
  login: string;
  role: 'admin' | 'user';
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  login: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface TrainingHistory {
  accuracy: number[];
  val_accuracy: number[];
  loss: number[];
  val_loss: number[];
}

export type ClassDistribution = Record<string, number>;

export type Top5Validation = Record<string, number>;

export interface SampleResult {
  index: number;
  true_label: number;
  predicted_label: number;
  confidence: number;
  correct: boolean;
}

export interface TestResult {
  accuracy: number;
  loss: number | null;
  total_samples: number;
  correct_samples: number;
  per_sample: SampleResult[];
}

export interface AuthStore {
  token: string;
  role: 'admin' | 'user';
  first_name: string;
  last_name: string;
  login: string;
}
