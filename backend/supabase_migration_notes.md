# Supabase Migration Notes

## Required environment variables

Update `backend/.env` with:

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-service-role-key-or-anon-key
```

## Supabase schema

Use `backend/supabase_schema.sql` to create the tables in Postgres.

## Next steps

1. Create a Supabase project.
2. Create the tables from `backend/supabase_schema.sql`.
3. Insert sample data for `movies` and `showtimes`.
4. Update backend code to use Supabase client.
