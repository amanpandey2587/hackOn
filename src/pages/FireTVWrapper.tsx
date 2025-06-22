
import {useUser } from "@clerk/clerk-react";
import FireTVWrapped from "@/components/FireTVWrapped";
const FireTVWrappedContainer = () => {
    const { user, isLoaded, isSignedIn } = useUser();
  
    if (!isLoaded) {
      return <div>Loading...</div>;
    }
  
    if (!isSignedIn) {
      return <div>Please sign in to see your wrapped!</div>;
    }
  
    return <FireTVWrapped userId={user.id} />;
  };

export default FireTVWrappedContainer