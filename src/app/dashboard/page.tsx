import React from 'react'
import { withAuth } from '@/lib/withAuth'
import { getAuthenticatedUser } from '@/lib/auth-actions'
import { redirect } from 'next/navigation';
import { Form } from '@/lib/form';
import { logout } from '@/lib/auth-actions';


const page = async () => {

    const user = await getAuthenticatedUser();
    if (!user) {
      return redirect("/login");
    }


  return (

    <div>You can see this because you are logged in!
        <h1>Hi, {user.username}!</h1>
        <p>Your user ID is {user.id}.</p>
        <Form action={logout}>
          <button>Sign out</button>
        </Form>
    </div>
  )
}

export default withAuth(page)