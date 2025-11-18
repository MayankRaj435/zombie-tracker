export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ConnectAWSRequest {
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsRegion: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    awsConnected: boolean;
  };
}






