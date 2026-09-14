import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000, 
});

/**
 * 1. Health check / Pre-warming
 */
export const checkServerHealth = async () => {
  const response = await API.get('/health');
  return response.data;
};

/**
 * Helper to construct FormData for image uploads
 */
const createDenoiseFormData = (file, sigma, addNoise) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sigma', sigma);
  formData.append('add_noise', addNoise);
  return formData;
};

/**
 * 2. PRIMARY INFERENCE PIPELINE
 * Submits the image to our optimized NAFNet endpoint.
 */
export const submitProcessJob = async (file, sigma = 25, addNoise = false) => {
  const formData = createDenoiseFormData(file, sigma, addNoise);
  const response = await API.post('/denoise/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data; 
};

/**
 * 3. Poll Job Status
 */
export const getJobStatus = async (jobId) => {
  const response = await API.get(`/job/${jobId}`);
  return response.data; 
};