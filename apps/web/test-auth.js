const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const email = 'test.rodri' + Date.now() + '@gmail.com';
  const password = 'Password123!';

  console.log('Signing up:', email);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    console.error('SignUp Error:', signUpError.message);
    return;
  }
  console.log('SignUp Success!');

  console.log('Signing in...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error('SignIn Error:', signInError.message);
  } else {
    console.log('SignIn Success!');
  }
}

test();
