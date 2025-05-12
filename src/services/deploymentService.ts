export const getDeploymentStatus = async ({ id }: { id: string }) => {
  try {
    // Use the Supabase Edge Function for deployment status
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deployment-status?id=${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch deployment status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching deployment status:', error);
    throw error;
  }
};