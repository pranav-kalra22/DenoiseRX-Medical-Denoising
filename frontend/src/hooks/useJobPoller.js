import { useEffect, useState, useRef } from 'react';
import { getJobStatus } from '../api/denoise';

export default function useJobPoller(jobId, onComplete, onError) {
  const [status, setStatus] = useState('idle');
  const statusRef = useRef('idle');
  
  // Create refs to hold the latest callback functions
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  // Update the refs whenever the parent passes new functions
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onComplete, onError]);

  useEffect(() => {
    // If there is no job, reset and do nothing
    if (!jobId) {
      setStatus('idle');
      statusRef.current = 'idle';
      return;
    }

    setStatus('queued');
    statusRef.current = 'queued';
    
    const checkStatus = async () => {
      try {
        const data = await getJobStatus(jobId);
        
        setStatus(data.status);
        statusRef.current = data.status;

        // Use the refs to call the parent functions safely!
        if (data.status === 'complete') {
          onCompleteRef.current(data);
        } else if (data.status === 'failed') {
          onErrorRef.current(data.error || "Inference failed on the server.");
        }
      } catch (err) {
        console.error("Polling error:", err);
        if (err.response?.status !== 429) {
            onErrorRef.current("Lost connection to the server while polling.");
            statusRef.current = 'failed';
        }
      }
    };

    // Initial check
    checkStatus();
    
    // The strict 1.5 second interval
    const intervalId = setInterval(() => {
      if (['queued', 'processing', 'idle'].includes(statusRef.current)) {
         checkStatus();
      }
    }, 1500);

    return () => clearInterval(intervalId);
    
  // Notice we completely removed onComplete and onError from this array
  // It will now ONLY re-trigger if the actual jobId string changes.
  }, [jobId]); 

  return status;
}