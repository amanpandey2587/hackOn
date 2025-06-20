import { Clerk } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

async function getTestToken() {
  const clerk = Clerk({ 
    secretKey: process.env.CLERK_SECRET_KEY 
  });

  try {
    // First, list all users to find your test user
    const users = await clerk.users.getUserList({ limit: 5 });
    console.log('Available users:');
    users.forEach(user => {
      console.log(`- ${user.id}: ${user.emailAddresses[0]?.emailAddress || 'No email'}`);
    });

    if (users.length === 0) {
      console.log('No users found');
      return;
    }

    // Get sessions for the first user
    const testUser = users[0];
    console.log(`\nGetting sessions for user: ${testUser.emailAddresses[0]?.emailAddress}`);
    
    const sessions = await clerk.sessions.getSessionList({ userId: testUser.id });
    
    if (sessions.length > 0) {
      const activeSession = sessions.find(s => s.status === 'active') || sessions[0];
      console.log('Session ID:', activeSession.id);
      
      // Note: Getting a token requires a template name, which is usually not needed for testing
      // Instead, you should get the token from the frontend
      console.log('\n⚠️  Note: Getting tokens from backend requires JWT templates.');
      console.log('It\'s easier to get the token from your browser.');
      console.log('\nUser ID for testing:', testUser.id);
      
    } else {
      console.log('No sessions found for this user');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

getTestToken();