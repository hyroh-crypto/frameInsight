export interface PhaseItem {
  name: string;
  done: boolean;
  active?: boolean;
}

export interface Phase {
  id: number;
  title: string;
  duration: string;
  status: string;
  items: PhaseItem[];
}

export interface Feature {
  id: string;
  name: string;
  desc: string;
  auth: string;
  required: string;
  priority: string;
}

export interface Permission {
  id: string;
  name: string;
  desc: string;
  menus: string;
  actions: string;
}

export interface Screen {
  id: string;
  name: string;
  desc: string;
  features: string[];
  data: string;
  roleAccess: string[];
}

export interface Inquiry {
  id: number;
  category: string;
  question: string;
  implication: string;
  status: 'pending' | 'resolved';
  answer?: string;
}