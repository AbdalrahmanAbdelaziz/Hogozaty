import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { BASE_URL } from '../shared/constants/urls';


export interface Specialization {
  id: number;
  name_Ar: string;
  name_En: string;
}

@Injectable({
  providedIn: 'root',
})
export class SpecializationService {
  private readonly SPECIALIZATION_ALL_URL = `${BASE_URL}/api/Specialization/all`;
  private readonly SPECIALIZATION_BY_ID_URL = `${BASE_URL}/api/Specialization`; // Base URL for fetching by ID

  constructor(private http: HttpClient) {}

  // Get all specializations
  getAllSpecializations(): Observable<Specialization[]> {
    return this.http.get<{ data: Specialization[] }>(this.SPECIALIZATION_ALL_URL).pipe(
      map(response => response.data)
    );
  }

  // Get specialization by ID
  getSpecializationById(id: number): Observable<string> {
    return this.http.get<{ data: Specialization }>(`${this.SPECIALIZATION_BY_ID_URL}/${id}`).pipe(
      map(response => response.data.name_En) // Extract English name
    );
  }
}
