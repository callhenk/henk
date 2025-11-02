-- Add trigger to automatically create account and business for new users
-- This trigger calls kit.new_user_created_setup() which:
-- 1. Creates an account for the new user
-- 2. Creates a default business for the user
-- 3. Adds the user as an owner team member of that business

-- Drop the trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION kit.new_user_created_setup();
