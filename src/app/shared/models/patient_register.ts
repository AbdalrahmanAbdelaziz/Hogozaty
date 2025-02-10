import { UserRegister } from "./UserRegister";

export interface PatientRegister extends UserRegister {
  emergencyContactName: string;
  emergencyContactPhone: string;
  bloodType?: string;
  userInsuranceProviderId?: string;
}
