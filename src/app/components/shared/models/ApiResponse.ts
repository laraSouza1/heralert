export interface ApiResponse {
  status: boolean;
  data: {
    reports: any[];
    total: number;
  };
  message?: string;
}