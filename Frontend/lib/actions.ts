'use server'

import { getUser, createUser, getLines as apiGetLines, getTrips as apiGetTrips, getTickets as apiGetTickets, getIncidents as apiGetIncidents } from './api';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const user = await getUser(email);

    if (user && user.password === password) {
        // In a real app, we would set a session cookie here
        // For this mock, we'll just return the user info to be stored in client context
        // But to make middleware work (if we had it), we might want a cookie
        (await cookies()).set('user_role', user.role);
        (await cookies()).set('user_id', user.id);

        return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    }

    return { success: false, error: 'Invalid credentials' };
}

export async function logoutAction() {
    (await cookies()).delete('user_role');
    (await cookies()).delete('user_id');
    redirect('/login');
}

export async function getLines() {
    return await apiGetLines();
}

export async function getTrips() {
    return await apiGetTrips();
}

export async function getTickets(userId: string) {
    return await apiGetTickets(userId);
}

export async function getIncidents() {
    return await apiGetIncidents();
}

export async function signupAction(formData: FormData) {
    const firstname = formData.get('firstname') as string;
    const lastname = formData.get('lastname') as string;
    const email = formData.get('email') as string;
    const password = formData.get('pwd') as string;

    if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
    }

    const existingUser = await getUser(email);
    if (existingUser) {
        return { success: false, error: 'User already exists' };
    }

    const newUser = {
        id: Date.now().toString(),
        name: `${firstname} ${lastname}`,
        email,
        password,
        role: 'user',
        subscription: 'none'
    };

    await createUser(newUser);

    return { success: true };
}
