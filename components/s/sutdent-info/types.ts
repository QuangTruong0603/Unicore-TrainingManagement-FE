export interface Address {
  id?: string;
  country: string;
  city: string;
  district: string;
  ward: string;
  addressDetail: string;
}

export interface Guardian {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
}

export interface StudentProfile {
  id: string;
  studentCode: string;
  accumulateCredits: number;
  accumulateScore: number;
  accumulateActivityScore: number;
  majorId: string;
  majorName: string;
  batchId: string;
  batchName: string;
  batchYear: number;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  status: string;
  imageUrl: string;
  address: Address;
  guardians: Guardian[];
  personId: string;
}
