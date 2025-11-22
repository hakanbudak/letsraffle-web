export type Mode = "manual" | "invite";

export interface FormField {
  value: string;
  inValidMessage: string;
}

export interface ParticipantForm {
  firstName: FormField;
  lastName: FormField;
  address: FormField;
  phone: FormField;
  email: FormField;
  isOrganizer: boolean;
}

export interface Participant {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
  isOrganizer: boolean;
}

export interface InvitedParticipant {
  id: number;
  firstName: string;
  lastName: string;
  address?: string;
  phone?: string;
  email: string;
  createdAt: string;
}

export type FieldKey = "firstName" | "lastName" | "address" | "phone" | "email";

export interface DrawDetail {
  id: number;
  drawType: string;
  status: string;
  inviteCode: string;
  requireAddress: boolean;
  requirePhone: boolean;
  drawDate: string | null;
  createdAt: string;
  language?: string;
  participantCount?: number;
  participants: InvitedParticipant[];
}

export interface DrawListItem {
  id: number;
  drawType: string;
  status: string;
  inviteCode: string;
  participantCount: number;
  createdAt: string;
  drawDate: string | null;
  language?: string;
}
