-- Run after the main profiles schema exists. The API also verifies this exact email
-- from a valid signed JWT so access is retained while the role migration is applied.
UPDATE profiles
SET role = 'admin', updated_at = CURRENT_TIMESTAMP
WHERE lower(email) = 'mahdialmuntadhar1@gmail.com';
