const API_BASE_URL = "http://localhost:4000/api";

export type PartyMember = {
  userId: string;
  username: string;
  joinedAt: string;
};

export type Party = {
  _id: string;
  title: string;
  members: PartyMember[];
  isPrivate: boolean;
  createdBy: {
    userId: string;
    username: string;
  };
  createdAt: string;
  tags?: string[]; // Add this!
};

export const partyService = {
  async getParties(): Promise<Party[]> {
    const response = await fetch(`${API_BASE_URL}/parties`);
    if (!response.ok) {
      throw new Error("Failed to fetch parties");
    }
    return response.json();
  },

  async createParty(data: { 
    title: string; 
    isPrivate: boolean; 
    password?: string;
    userId: string;
    username: string;
  }): Promise<Party> {
    const response = await fetch(`${API_BASE_URL}/parties`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || "Failed to create party");
    }
    
    return responseData;
  },

  async joinParty(partyId: string, data: {
    userId: string;
    username: string;
    password?: string;
  }): Promise<Party> {
    const response = await fetch(`${API_BASE_URL}/parties/${partyId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || "Failed to join party");
    }
    
    return responseData;
  },

  async leaveParty(partyId: string, userId: string): Promise<Party> {
    const response = await fetch(`${API_BASE_URL}/parties/${partyId}/leave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to leave party");
    }
    
    return response.json();
  },
  async getAllowedTags(): Promise<string[]> {

    const response = await fetch(`${API_BASE_URL}/parties/allowed-tags`);

    if (!response.ok) {

      throw new Error("Failed to fetch allowed tags");

    }

    const { tags } = await response.json();

    return tags;

  },


  // Get current tags for a party

  async getPartyTags(partyId: string): Promise<string[]> {

    const response = await fetch(`${API_BASE_URL}/parties/${partyId}/tags`);

    if (!response.ok) {

      throw new Error("Failed to fetch party tags");

    }

    const { tags } = await response.json();

    return tags;

  },


  // Add (set) tags for a party (adds unique tags to existing)

  async addPartyTags(partyId: string, tags: string[]): Promise<string[]> {

    const response = await fetch(`${API_BASE_URL}/parties/${partyId}/tags`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ tags }),

    });

    if (!response.ok) {

      throw new Error("Failed to add party tags");

    }

    const { tags: newTags } = await response.json();

    return newTags;

  },


  // Remove given tags from party

  async removePartyTags(partyId: string, tags: string[]): Promise<string[]> {

    const response = await fetch(`${API_BASE_URL}/parties/${partyId}/tags`, {

      method: "DELETE",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ tags }),

    });

    if (!response.ok) {

      throw new Error("Failed to remove party tags");

    }

    const { tags: remainingTags } = await response.json();

    return remainingTags;

  },  
};