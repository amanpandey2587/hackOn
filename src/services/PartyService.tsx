// src/services/partyService.ts
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
};