export interface UserRegister {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  profilePicture?: File;
  genderId: string;
  countryId: string;
  governorateId: string;
  districtId: string;
  
  // 🔹 Add the missing fields to match PatientRegister
  emergencyContactName: string;
  emergencyContactPhone: string;
}
