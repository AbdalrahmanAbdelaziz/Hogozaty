import { UserRegister } from "./UserRegister";

export interface Patient extends UserRegister {
  emergencyContactName: string;
  emergencyContactPhone: string;
  bloodType?: string;
  userInsuranceProviderId?: string;
}
