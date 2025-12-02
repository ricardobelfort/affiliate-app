export const environment = {
  production: true,
  supabase: {
    url: 'https://zpxzheflrrnnzvbxbjbi.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpweHpoZWZscnJubnp2YnhiamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDkyMzIsImV4cCI6MjA4MDE4NTIzMn0.StjzIub2qXszbChQdqG-_J62wSOWFwmLcIzzwM0ZHkQ'
  },
  amazon: {
    accessKey: '', // Configurar AMAZON_ACCESS_KEY na Vercel
    secretKey: '', // Configurar AMAZON_SECRET_KEY na Vercel
    partnerTag: '', // Configurar AMAZON_PARTNER_TAG na Vercel
    region: 'us-east-1',
    host: 'webservices.amazon.com',
    marketplace: 'www.amazon.com'
  },
  geminiApiKey: '' // Configurar GOOGLE_GEMINI_API_KEY na Vercel
};