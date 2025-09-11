import { createClient } from "@supabase/supabase-js";
export const supabaseUrl = "https://pwdoalxbjdudcjnftvsw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZG9hbHhiamR1ZGNqbmZ0dnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg5NDgxOTYsImV4cCI6MjAyNDUyNDE5Nn0.VWpNVwZDtmkojhbizy1BkgtFMtg4pNEeFo7I-RrsC4s";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
