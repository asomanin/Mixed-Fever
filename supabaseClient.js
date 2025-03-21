import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = 'https://xyvvwattydmoeccnqvyp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dnZ3YXR0eWRtb2VjY25xdnlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyNzY1OTcsImV4cCI6MjA1Nzg1MjU5N30.TrF06qmhY_NcSoIxJHp1K6vfzlo2t2A96R68-bONQNQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// export default supabase;
